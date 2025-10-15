from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Produto, Categoria, Avaliacao
from usuarios.models import ListaDesejo
import logging

logger = logging.getLogger(__name__)


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
    
    # Avaliações do produto
    avaliacoes = produto.avaliacoes.select_related('usuario').order_by('-criado_em')
    
    em_lista_desejos = False
    ja_avaliou = False
    
    if request.user.is_authenticated:
        em_lista_desejos = ListaDesejo.objects.filter(
            usuario=request.user,
            produto=produto
        ).exists()
        
        ja_avaliou = Avaliacao.objects.filter(
            usuario=request.user,
            produto=produto
        ).exists()

    context = {
        'produto': produto,
        'produtos_relacionados': produtos_relacionados,
        'em_lista_desejos': em_lista_desejos,
        'avaliacoes': avaliacoes,
        'ja_avaliou': ja_avaliou,
    }
    return render(request, 'produtos/detalhe.html', context)


@login_required
def adicionar_avaliacao(request, produto_id):
    """Adiciona uma avaliação para um produto."""
    if request.method != 'POST':
        return redirect('produtos:lista')
    
    produto = get_object_or_404(Produto, id=produto_id, ativo=True)
    
    # Verifica se o usuário já avaliou o produto
    if Avaliacao.objects.filter(usuario=request.user, produto=produto).exists():
        messages.warning(request, 'Você já avaliou este produto.')
        return redirect('produtos:detalhe', slug=produto.slug)
    
    try:
        rating = int(request.POST.get('rating', 0))
        if rating < 1 or rating > 5:
            raise ValueError('Rating inválido')
        
        comentario = request.POST.get('comentario', '').strip()
        
        Avaliacao.objects.create(
            produto=produto,
            usuario=request.user,
            rating=rating,
            comentario=comentario
        )
        
        messages.success(request, 'Sua avaliação foi enviada com sucesso!')
        logger.info(
            f'Avaliação criada: Produto {produto.nome} (ID: {produto.id}), '
            f'Usuário: {request.user.username}, Rating: {rating}'
        )
        
    except (ValueError, TypeError) as e:
        messages.error(request, 'Dados de avaliação inválidos.')
        logger.error(f'Erro ao criar avaliação: {str(e)}')
    
    return redirect('produtos:detalhe', slug=produto.slug)
