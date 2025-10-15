from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from produtos.models import Produto
from pedidos.models import Pedido
from .models import ConsentimentoLGPD, SolicitacaoDados, PoliticaPrivacidade
import json
import logging

logger = logging.getLogger(__name__)


def home(request):
    """View para a página inicial."""
    # Produtos em destaque
    produtos_destaque = Produto.objects.filter(
        ativo=True, 
        destaque=True
    ).select_related('categoria')[:6]
    
    # Produtos em promoção
    produtos_promocao = Produto.objects.filter(
        ativo=True,
        preco_promocional__isnull=False
    ).select_related('categoria')[:6]
    
    context = {
        'produtos_destaque': produtos_destaque,
        'produtos_promocao': produtos_promocao,
    }
    return render(request, 'core/home.html', context)


@login_required
def meus_dados_lgpd(request):
    """View para o usuário visualizar e gerenciar seus dados (LGPD)."""
    consentimentos = ConsentimentoLGPD.objects.filter(usuario=request.user).order_by('-data_consentimento')
    solicitacoes = SolicitacaoDados.objects.filter(usuario=request.user).order_by('-data_solicitacao')
    politica_ativa = PoliticaPrivacidade.objects.filter(ativa=True).first()
    
    context = {
        'consentimentos': consentimentos,
        'solicitacoes': solicitacoes,
        'politica_ativa': politica_ativa,
    }
    return render(request, 'core/meus_dados_lgpd.html', context)


@login_required
def solicitar_dados(request):
    """View para o usuário solicitar acesso, correção ou exclusão de dados."""
    if request.method == 'POST':
        tipo = request.POST.get('tipo')
        descricao = request.POST.get('descricao', '')
        
        if tipo in dict(SolicitacaoDados.TIPO_SOLICITACAO_CHOICES):
            # Obtém IP do usuário
            ip_address = request.META.get('REMOTE_ADDR')
            
            solicitacao = SolicitacaoDados.objects.create(
                usuario=request.user,
                tipo=tipo,
                descricao=descricao,
                ip_solicitacao=ip_address
            )
            
            logger.info(f'Nova solicitação LGPD criada: {solicitacao.get_tipo_display()} - Usuário: {request.user.username}')
            
            messages.success(
                request, 
                f'Sua solicitação de "{solicitacao.get_tipo_display()}" foi registrada. '
                'Você receberá uma resposta em até 15 dias conforme a LGPD.'
            )
            return redirect('core:meus_dados_lgpd')
        else:
            messages.error(request, 'Tipo de solicitação inválido.')
    
    return render(request, 'core/solicitar_dados.html', {
        'tipos_solicitacao': SolicitacaoDados.TIPO_SOLICITACAO_CHOICES
    })


@login_required
def exportar_meus_dados(request):
    """Exporta todos os dados do usuário em formato JSON (portabilidade)."""
    usuario = request.user
    
    # Coleta dados do usuário
    dados = {
        'usuario': {
            'username': usuario.username,
            'email': usuario.email,
            'first_name': usuario.first_name,
            'last_name': usuario.last_name,
            'date_joined': usuario.date_joined.isoformat() if usuario.date_joined else None,
        },
        'consentimentos': [],
        'pedidos': [],
        'solicitacoes_lgpd': [],
    }
    
    # Consentimentos
    for consentimento in ConsentimentoLGPD.objects.filter(usuario=usuario):
        dados['consentimentos'].append({
            'tipo': consentimento.get_tipo_display(),
            'consentido': consentimento.consentido,
            'data': consentimento.data_consentimento.isoformat(),
            'versao_termos': consentimento.versao_termos,
        })
    
    # Pedidos
    for pedido in Pedido.objects.filter(usuario=usuario).prefetch_related('itens__produto'):
        dados['pedidos'].append({
            'id': pedido.id,
            'data': pedido.criado_em.isoformat(),
            'status': pedido.status,
            'total': str(pedido.total),
            'itens': [
                {
                    'produto': item.produto.nome,
                    'quantidade': item.quantidade,
                    'preco': str(item.preco),
                }
                for item in pedido.itens.all()
            ]
        })
    
    # Solicitações LGPD
    for solicitacao in SolicitacaoDados.objects.filter(usuario=usuario):
        dados['solicitacoes_lgpd'].append({
            'tipo': solicitacao.get_tipo_display(),
            'status': solicitacao.get_status_display(),
            'data_solicitacao': solicitacao.data_solicitacao.isoformat(),
            'data_conclusao': solicitacao.data_conclusao.isoformat() if solicitacao.data_conclusao else None,
        })
    
    # Registra log de exportação
    logger.info(f'Exportação de dados realizada pelo usuário: {usuario.username}')
    
    # Cria solicitação de portabilidade automaticamente
    SolicitacaoDados.objects.create(
        usuario=usuario,
        tipo='portabilidade',
        status='concluida',
        descricao='Exportação automática de dados pelo usuário',
        resposta='Dados exportados com sucesso',
        ip_solicitacao=request.META.get('REMOTE_ADDR'),
        data_processamento=timezone.now(),
        data_conclusao=timezone.now(),
    )
    
    # Retorna JSON
    response = HttpResponse(
        json.dumps(dados, indent=2, ensure_ascii=False),
        content_type='application/json; charset=utf-8'
    )
    response['Content-Disposition'] = f'attachment; filename="meus_dados_{usuario.username}_{timezone.now().strftime("%Y%m%d")}.json"'
    
    return response


@login_required
def revogar_consentimento(request, consentimento_id):
    """Permite ao usuário revogar um consentimento."""
    if request.method == 'POST':
        try:
            consentimento = ConsentimentoLGPD.objects.get(
                id=consentimento_id,
                usuario=request.user
            )
            consentimento.consentido = False
            consentimento.data_revogacao = timezone.now()
            consentimento.save()
            
            logger.info(f'Consentimento revogado: {consentimento.get_tipo_display()} - Usuário: {request.user.username}')
            messages.success(request, f'Consentimento de "{consentimento.get_tipo_display()}" revogado com sucesso.')
        except ConsentimentoLGPD.DoesNotExist:
            messages.error(request, 'Consentimento não encontrado.')
    
    return redirect('core:meus_dados_lgpd')


def politica_privacidade(request):
    """Exibe a política de privacidade ativa."""
    politica = PoliticaPrivacidade.objects.filter(ativa=True).first()
    
    if not politica:
        messages.warning(request, 'Política de privacidade não disponível no momento.')
        return redirect('core:home')
    
    context = {
        'politica': politica,
    }
    return render(request, 'core/politica_privacidade.html', context)
