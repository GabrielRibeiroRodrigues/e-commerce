"""Utilitários para envio de e-mails transacionais."""

import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site

logger = logging.getLogger(__name__)


def enviar_email_template(assunto, template_name, contexto, destinatarios, request=None):
    """
    Envia um e-mail usando um template HTML.
    
    Args:
        assunto: Assunto do e-mail
        template_name: Nome do template (sem extensão)
        contexto: Dicionário com variáveis do template
        destinatarios: Lista de e-mails destinatários
        request: HttpRequest object (opcional, para obter URL do site)
    
    Returns:
        bool: True se enviado com sucesso, False caso contrário
    """
    try:
        # Adiciona URL do site ao contexto
        if request:
            site_url = request.build_absolute_uri('/')
        else:
            site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
        
        contexto['site_url'] = site_url.rstrip('/')
        
        # Renderiza o template HTML
        html_content = render_to_string(f'emails/{template_name}.html', contexto)
        
        # Cria o e-mail
        email = EmailMultiAlternatives(
            subject=assunto,
            body='Este e-mail requer um cliente que suporte HTML.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=destinatarios if isinstance(destinatarios, list) else [destinatarios],
        )
        
        email.attach_alternative(html_content, "text/html")
        
        # Envia o e-mail
        email.send(fail_silently=False)
        
        logger.info(
            f'E-mail enviado com sucesso: {assunto} para {destinatarios}'
        )
        return True
        
    except Exception as e:
        logger.error(
            f'Erro ao enviar e-mail: {assunto} para {destinatarios}. Erro: {str(e)}',
            exc_info=True
        )
        return False


def enviar_email_boas_vindas(user, request=None):
    """Envia e-mail de boas-vindas para novo usuário."""
    if not user.email:
        logger.warning(f'Usuário {user.username} não possui e-mail cadastrado')
        return False
    
    contexto = {'user': user}
    
    return enviar_email_template(
        assunto='Bem-vindo à Farmácia QUEOPS!',
        template_name='boas_vindas',
        contexto=contexto,
        destinatarios=user.email,
        request=request
    )


def enviar_email_confirmacao_pedido(pedido, request=None):
    """Envia e-mail de confirmação de pedido."""
    if not pedido.usuario.email:
        logger.warning(f'Usuário {pedido.usuario.username} não possui e-mail cadastrado')
        return False
    
    try:
        pagamento = pedido.pagamento
    except Exception:
        pagamento = None
    
    contexto = {
        'pedido': pedido,
        'pagamento': pagamento,
    }
    
    return enviar_email_template(
        assunto=f'Pedido #{pedido.id} Confirmado - Farmácia QUEOPS',
        template_name='confirmacao_pedido',
        contexto=contexto,
        destinatarios=pedido.usuario.email,
        request=request
    )


def enviar_email_pedido_enviado(pedido, request=None):
    """Envia e-mail notificando que o pedido foi enviado."""
    if not pedido.usuario.email:
        logger.warning(f'Usuário {pedido.usuario.username} não possui e-mail cadastrado')
        return False
    
    contexto = {'pedido': pedido}
    
    return enviar_email_template(
        assunto=f'Pedido #{pedido.id} Enviado - Farmácia QUEOPS',
        template_name='pedido_enviado',
        contexto=contexto,
        destinatarios=pedido.usuario.email,
        request=request
    )
