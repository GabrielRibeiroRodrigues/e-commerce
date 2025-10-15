"""Signals para o app usuarios."""
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from pedidos.services.carrinho_service import CarrinhoService


@receiver(user_logged_in)
def migrar_carrinho_anonimo(sender, request, user, **kwargs):
    """
    Migra o carrinho anônimo para o usuário autenticado quando faz login.
    
    Args:
        sender: Classe do modelo User
        request: HttpRequest object
        user: Usuário que acabou de fazer login
        **kwargs: Argumentos adicionais do signal
    """
    session_key = request.session.session_key
    if session_key:
        count = CarrinhoService.migrar_carrinho_anonimo_para_usuario(session_key, user)
        if count > 0:
            # Opcional: adicionar mensagem ao usuário
            from django.contrib import messages
            messages.success(
                request,
                f'{count} {"item" if count == 1 else "itens"} do seu carrinho {"foi transferido" if count == 1 else "foram transferidos"}.'
            )
