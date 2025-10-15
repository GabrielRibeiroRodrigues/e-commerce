from django.shortcuts import render
from produtos.models import Produto


def home(request):
    """View para a página inicial."""
    # Produtos em destaque
    produtos_destaque = Produto.objects.filter(
        ativo=True, 
        destaque=True
    )[:6]
    
    # Produtos em promoção
    produtos_promocao = Produto.objects.filter(
        ativo=True,
        preco_promocional__isnull=False
    )[:6]
    
    context = {
        'produtos_destaque': produtos_destaque,
        'produtos_promocao': produtos_promocao,
    }
    return render(request, 'core/home.html', context)
