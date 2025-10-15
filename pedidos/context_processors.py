def carrinho_context(request):
    """Context processor para adicionar informações do carrinho em todos os templates."""
    carrinho = request.session.get('carrinho', {})
    
    # Calcula o número total de itens no carrinho
    carrinho_count = sum(item['quantidade'] for item in carrinho.values())
    
    return {
        'carrinho_count': carrinho_count,
    }
