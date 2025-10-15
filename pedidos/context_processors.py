from usuarios.models import ListaDesejo


def carrinho_context(request):
    """Context processor para adicionar informações do carrinho em todos os templates."""
    carrinho = request.session.get('carrinho', {})
    
    # Calcula o número total de itens no carrinho
    carrinho_count = sum(item['quantidade'] for item in carrinho.values())
    wishlist_count = 0
    if request.user.is_authenticated:
        wishlist_count = ListaDesejo.objects.filter(usuario=request.user).count()
    
    return {
        'carrinho_count': carrinho_count,
        'wishlist_count': wishlist_count,
    }
