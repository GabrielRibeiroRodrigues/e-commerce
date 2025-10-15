import json
import secrets
from urllib import parse, request as urlrequest, error as urlerror

from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.contrib import messages
from django.urls import reverse
from django.utils.http import url_has_allowed_host_and_scheme, urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.core.mail import send_mail
from pedidos.models import Pedido, Pagamento
from produtos.models import Produto
from .models import ListaDesejo, ContaSocial
from core.email_utils import enviar_email_boas_vindas
import logging

logger = logging.getLogger(__name__)


User = get_user_model()


def _redirecionar_destino(request, fallback_url: str):
    """Resolve a URL de retorno segura após uma ação."""
    next_url = request.POST.get('next') or request.GET.get('next') or request.META.get('HTTP_REFERER')
    if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}, require_https=request.is_secure()):
        return redirect(next_url)
    return redirect(fallback_url)


def registro(request):
    """View para registro de novos usuários."""
    if request.user.is_authenticated:
        return redirect('core:home')
    
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            
            # Envia e-mail de boas-vindas
            enviar_email_boas_vindas(user, request)
            
            messages.success(request, 'Conta criada com sucesso! Bem-vindo à QUEOPS!')
            logger.info(f'Novo usuário cadastrado: {user.username}')
            return redirect('core:home')
        else:
            messages.error(request, 'Erro ao criar conta. Verifique os dados informados.')
    else:
        form = UserCreationForm()
    
    return render(request, 'usuarios/registro.html', {'form': form})


def login_view(request):
    """View para login de usuários."""
    if request.user.is_authenticated:
        return redirect('core:home')
    
    next_param = request.GET.get('next')
    next_safe = None
    if next_param and url_has_allowed_host_and_scheme(next_param, allowed_hosts={request.get_host()}, require_https=request.is_secure()):
        next_safe = next_param

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Bem-vindo de volta, {username}!')
                destino = next_safe or 'core:home'
                return redirect(destino)
        messages.error(request, 'Usuário ou senha inválidos.')
    else:
        form = AuthenticationForm()

    context = {
        'form': form,
        'google_login_enabled': bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        'google_next': next_safe,
    }
    return render(request, 'usuarios/login.html', context)


def logout_view(request):
    """View para logout de usuários."""
    logout(request)
    messages.info(request, 'Você saiu da sua conta.')
    return redirect('core:home')


def login_google(request):
    """Inicia o fluxo de autenticação com o Google OAuth 2.0."""

    if request.user.is_authenticated:
        return redirect('core:home')

    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        messages.error(request, 'Login com Google não está configurado.')
        return redirect('usuarios:login')

    next_param = request.GET.get('next')
    next_safe = None
    if next_param and url_has_allowed_host_and_scheme(next_param, allowed_hosts={request.get_host()}, require_https=request.is_secure()):
        next_safe = next_param

    redirect_uri = request.build_absolute_uri(reverse('usuarios:login_google_callback'))
    request.session['google_redirect_uri'] = redirect_uri
    request.session['google_oauth_state'] = secrets.token_urlsafe(32)
    request.session['google_next'] = next_safe

    params = {
        'client_id': settings.GOOGLE_CLIENT_ID,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': settings.GOOGLE_OAUTH_SCOPE,
        'state': request.session['google_oauth_state'],
        'access_type': 'offline',
        'prompt': 'consent',
    }

    auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + parse.urlencode(params)
    return redirect(auth_url)


def login_google_callback(request):
    """Processa o retorno do Google finalizando o login do usuário."""

    if request.user.is_authenticated:
        return redirect('core:home')

    stored_state = request.session.pop('google_oauth_state', None)
    returned_state = request.GET.get('state')

    if not stored_state or stored_state != returned_state:
        request.session.pop('google_redirect_uri', None)
        messages.error(request, 'Estado de autenticação inválido. Tente novamente.')
        return redirect('usuarios:login')

    if request.GET.get('error'):
        error_desc = request.GET.get('error_description') or 'Autenticação cancelada.'
        request.session.pop('google_redirect_uri', None)
        messages.error(request, f'Login com Google não autorizado: {error_desc}')
        return redirect('usuarios:login')

    codigo = request.GET.get('code')
    if not codigo:
        request.session.pop('google_redirect_uri', None)
        messages.error(request, 'Código de autorização não informado pelo Google.')
        return redirect('usuarios:login')

    redirect_uri = request.session.get('google_redirect_uri') or request.build_absolute_uri(reverse('usuarios:login_google_callback'))

    token_payload = {
        'code': codigo,
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }

    token_request = urlrequest.Request(
        url='https://oauth2.googleapis.com/token',
        data=parse.urlencode(token_payload).encode(),
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )

    try:
        with urlrequest.urlopen(token_request, timeout=10) as token_response:
            token_data = json.loads(token_response.read().decode())
    except urlerror.URLError:
        request.session.pop('google_redirect_uri', None)
        messages.error(request, 'Não foi possível conectar ao Google. Tente novamente.')
        return redirect('usuarios:login')

    access_token = token_data.get('access_token')
    if not access_token:
        request.session.pop('google_redirect_uri', None)
        messages.error(request, 'Resposta inválida do Google. Não foi possível obter o token de acesso.')
        return redirect('usuarios:login')

    userinfo_request = urlrequest.Request(
        url='https://www.googleapis.com/oauth2/v3/userinfo',
        headers={'Authorization': f'Bearer {access_token}'},
    )

    try:
        with urlrequest.urlopen(userinfo_request, timeout=10) as userinfo_response:
            userinfo = json.loads(userinfo_response.read().decode())
    except urlerror.URLError:
        request.session.pop('google_redirect_uri', None)
        messages.error(request, 'Não foi possível obter as informações da conta Google.')
        return redirect('usuarios:login')

    google_id = userinfo.get('sub')
    email = (userinfo.get('email') or '').strip().lower()
    nome_completo = (userinfo.get('name') or '').strip()
    primeiro_nome = (userinfo.get('given_name') or '').strip()
    ultimo_nome = (userinfo.get('family_name') or '').strip()

    if not google_id or not email:
        request.session.pop('google_redirect_uri', None)
        messages.error(request, 'Não recebemos os dados necessários do Google para concluir o login.')
        return redirect('usuarios:login')

    conta_social = ContaSocial.objects.filter(
        provedor=ContaSocial.PROVEDOR_GOOGLE,
        external_id=google_id,
    ).select_related('usuario').first()

    if conta_social:
        usuario = conta_social.usuario
        if conta_social.email != email:
            conta_social.email = email
            conta_social.save(update_fields=['email', 'atualizado_em'])
    else:
        usuario = User.objects.filter(email=email).first()

        if not usuario:
            base_username = email.split('@')[0] or 'usuario'
            base_username = base_username[:30]
            username = base_username or f'user{secrets.randbelow(9999):04d}'
            contador = 1
            while User.objects.filter(username=username).exists():
                sufixo = f'-{contador}'
                username = f"{base_username[:30 - len(sufixo)]}{sufixo}" or f'user{secrets.randbelow(9999):04d}'
                contador += 1

            usuario = User.objects.create_user(username=username, email=email)
            usuario.set_unusable_password()

        if not usuario.first_name and (primeiro_nome or nome_completo):
            usuario.first_name = primeiro_nome or nome_completo.split(' ')[0]
        if not usuario.last_name and ultimo_nome:
            usuario.last_name = ultimo_nome
        usuario.save()

        ContaSocial.objects.update_or_create(
            provedor=ContaSocial.PROVEDOR_GOOGLE,
            external_id=google_id,
            defaults={'usuario': usuario, 'email': email},
        )

    login(request, usuario)
    messages.success(request, f'Olá, {usuario.first_name or usuario.username}! Login com Google realizado.')

    destino = request.session.pop('google_next', None)
    request.session.pop('google_redirect_uri', None)

    if destino and not url_has_allowed_host_and_scheme(destino, allowed_hosts={request.get_host()}, require_https=request.is_secure()):
        destino = None

    return redirect(destino or 'core:home')


@login_required
def perfil(request):
    """View para perfil do usuário com histórico de pedidos."""
    pedidos_queryset = (
        Pedido.objects.filter(usuario=request.user)
        .select_related('pagamento')
        .prefetch_related('itens__produto')
        .order_by('-criado_em')
    )

    pedidos = []
    for pedido in pedidos_queryset:
        try:
            pagamento_relacionado = pedido.pagamento
        except Pagamento.DoesNotExist:
            pagamento_relacionado = None

        setattr(pedido, 'pagamento_info', pagamento_relacionado)
        pedidos.append(pedido)
    
    context = {
        'pedidos': pedidos,
    }
    return render(request, 'usuarios/perfil.html', context)


@login_required
def lista_desejos(request):
    """Exibe os itens favoritados pelo usuário."""
    itens = ListaDesejo.objects.filter(usuario=request.user).select_related('produto__categoria')

    context = {
        'itens_desejados': itens,
    }
    return render(request, 'usuarios/lista_desejos.html', context)


@login_required
def adicionar_lista_desejos(request, produto_id):
    """Adiciona um produto à lista de desejos do usuário."""
    produto = get_object_or_404(Produto, id=produto_id, ativo=True)

    if request.method != 'POST':
        return redirect('produtos:detalhe', slug=produto.slug)

    item, criado = ListaDesejo.objects.get_or_create(usuario=request.user, produto=produto)
    if criado:
        messages.success(request, f'{produto.nome} adicionado à sua lista de desejos.')
    else:
        messages.info(request, f'{produto.nome} já está na sua lista de desejos.')

    retorno_padrao = reverse('produtos:detalhe', args=[produto.slug])
    return _redirecionar_destino(request, retorno_padrao)


@login_required
def remover_lista_desejos(request, produto_id):
    """Remove um produto da lista de desejos do usuário."""
    produto = get_object_or_404(Produto, id=produto_id)

    if request.method != 'POST':
        return redirect('usuarios:lista_desejos')

    removidos, _ = ListaDesejo.objects.filter(usuario=request.user, produto=produto).delete()
    if removidos:
        messages.success(request, f'{produto.nome} removido da sua lista de desejos.')
    else:
        messages.info(request, f'{produto.nome} não estava na sua lista de desejos.')

    retorno_padrao = reverse('usuarios:lista_desejos')
    return _redirecionar_destino(request, retorno_padrao)


def recuperar_senha(request):
    """View para solicitar recuperação de senha."""
    if request.user.is_authenticated:
        return redirect('core:home')
    
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        
        if email:
            # Busca usuário por e-mail
            usuario = User.objects.filter(email=email).first()
            
            if usuario:
                # Gera token de recuperação
                token = default_token_generator.make_token(usuario)
                uid = urlsafe_base64_encode(force_bytes(usuario.pk))
                
                # Cria URL de recuperação
                url_recuperacao = request.build_absolute_uri(
                    reverse('usuarios:redefinir_senha', kwargs={'uidb64': uid, 'token': token})
                )
                
                # Renderiza e envia e-mail
                context = {
                    'usuario': usuario,
                    'url_recuperacao': url_recuperacao,
                }
                
                html_message = render_to_string('emails/recuperacao_senha.html', context)
                
                try:
                    send_mail(
                        subject='Recuperação de Senha - Farmácia QUEOPS',
                        message=f'Olá {usuario.first_name or usuario.username},\n\nAcesse o link para redefinir sua senha: {url_recuperacao}',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[usuario.email],
                        html_message=html_message,
                        fail_silently=False,
                    )
                    logger.info(f'E-mail de recuperação enviado para: {usuario.email}')
                except Exception as e:
                    logger.error(f'Erro ao enviar e-mail de recuperação: {e}')
        
        # Sempre redireciona para confirmação (segurança - não revela se e-mail existe)
        return redirect('usuarios:recuperar_senha_confirmacao')
    
    return render(request, 'usuarios/recuperar_senha.html')


def recuperar_senha_confirmacao(request):
    """View de confirmação de envio de e-mail de recuperação."""
    return render(request, 'usuarios/recuperar_senha_confirmacao.html')


def redefinir_senha(request, uidb64, token):
    """View para redefinir senha usando token."""
    if request.user.is_authenticated:
        return redirect('core:home')
    
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        usuario = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        usuario = None
    
    # Valida token
    if usuario is not None and default_token_generator.check_token(usuario, token):
        if request.method == 'POST':
            form = SetPasswordForm(usuario, request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, 'Senha redefinida com sucesso! Você já pode fazer login.')
                logger.info(f'Senha redefinida para usuário: {usuario.username}')
                return redirect('usuarios:login')
        else:
            form = SetPasswordForm(usuario)
        
        return render(request, 'usuarios/redefinir_senha.html', {'form': form})
    else:
        messages.error(request, 'Link de recuperação inválido ou expirado.')
        return redirect('usuarios:recuperar_senha')
