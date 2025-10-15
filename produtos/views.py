from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q
from .models import Produto, Categoria
from usuarios.models import ListaDesejo


def lista_produtos(request):
    """View para listagem de produtos com filtros e busca."""
    produtos = Produto.objects.filter(ativo=True).select_related('categoria')
    categorias = Categoria.objects.all().order_by('nome')
    
    # Filtro por categoria
    categoria_slug = request.GET.get('categoria')
    if categoria_slug:
        produtos = produtos.filter(categoria__slug=categoria_slug)
    
    # Busca por nome
    busca = request.GET.get('q')
    if busca:
        produtos = produtos.filter(
            Q(nome__icontains=busca) | 
            Q(descricao__icontains=busca)
        )
    
    # Ordenação
    ordem = request.GET.get('ordem', '-criado_em')
    produtos = produtos.order_by(ordem)
    
    # Paginação
    paginator = Paginator(produtos, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    wishlist_ids = set()
    if request.user.is_authenticated:
        wishlist_ids = set(
            ListaDesejo.objects.filter(usuario=request.user)
            .values_list('produto_id', flat=True)
        )

    context = {
        'page_obj': page_obj,
        'categorias': categorias,
        'categoria_selecionada': categoria_slug,
        'busca': busca,
        'ordem': ordem,
        'wishlist_ids': wishlist_ids,
    }
    return render(request, 'produtos/lista.html', context)


def detalhe_produto(request, slug):
    """View para detalhes de um produto."""
    produto = get_object_or_404(
        Produto.objects.select_related('categoria'),
        slug=slug,
        ativo=True
    )
    
    # Produtos relacionados (mesma categoria)
    produtos_relacionados = Produto.objects.filter(
        categoria=produto.categoria,
        ativo=True
    ).select_related('categoria').exclude(id=produto.id)[:4]
    
    em_lista_desejos = False
    if request.user.is_authenticated:
        em_lista_desejos = ListaDesejo.objects.filter(
            usuario=request.user,
            produto=produto
        ).exists()

    context = {
        'produto': produto,
        'produtos_relacionados': produtos_relacionados,
        'em_lista_desejos': em_lista_desejos,
    }
    return render(request, 'produtos/detalhe.html', context)
