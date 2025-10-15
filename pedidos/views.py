from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from decimal import Decimal
from produtos.models import Produto
from .models import Pedido, ItemPedido


def carrinho(request):
    """View para exibir o carrinho de compras."""
    carrinho = request.session.get('carrinho', {})
    
    # Montar estrutura do carrinho com objetos de produtos
    itens_carrinho = []
    total = Decimal('0.00')
    
    for produto_id, item_data in carrinho.items():
        produto = Produto.objects.get(id=produto_id)
        subtotal = produto.preco_final * item_data['quantidade']
        itens_carrinho.append({
            'produto': produto,
            'quantidade': item_data['quantidade'],
            'subtotal': subtotal,
        })
        total += subtotal
    
    context = {
        'itens_carrinho': itens_carrinho,
        'total': total,
    }
    return render(request, 'pedidos/carrinho.html', context)


def adicionar_carrinho(request, produto_id):
    """View para adicionar produto ao carrinho."""
    if request.method == 'POST':
        produto = get_object_or_404(Produto, id=produto_id, ativo=True)
        quantidade = int(request.POST.get('quantidade', 1))
        
        # Validar quantidade
        if quantidade < 1:
            messages.error(request, 'Quantidade inválida.')
            return redirect('produtos:detalhe', slug=produto.slug)
        
        if quantidade > produto.estoque:
            messages.error(request, f'Apenas {produto.estoque} unidades disponíveis.')
            return redirect('produtos:detalhe', slug=produto.slug)
        
        # Adicionar ao carrinho na sessão
        carrinho = request.session.get('carrinho', {})
        
        if str(produto_id) in carrinho:
            # Atualizar quantidade
            nova_quantidade = carrinho[str(produto_id)]['quantidade'] + quantidade
            if nova_quantidade > produto.estoque:
                messages.error(request, f'Apenas {produto.estoque} unidades disponíveis.')
                return redirect('produtos:detalhe', slug=produto.slug)
            carrinho[str(produto_id)]['quantidade'] = nova_quantidade
            messages.success(request, f'Quantidade de {produto.nome} atualizada no carrinho.')
        else:
            # Adicionar novo item
            carrinho[str(produto_id)] = {
                'quantidade': quantidade,
            }
            messages.success(request, f'{produto.nome} adicionado ao carrinho.')
        
        request.session['carrinho'] = carrinho
        request.session.modified = True
        
        return redirect('pedidos:carrinho')
    
    return redirect('core:home')


def atualizar_carrinho(request, produto_id):
    """View para atualizar quantidade de item no carrinho."""
    if request.method == 'POST':
        produto = get_object_or_404(Produto, id=produto_id)
        quantidade = int(request.POST.get('quantidade', 1))
        
        carrinho = request.session.get('carrinho', {})
        
        if str(produto_id) in carrinho:
            if quantidade < 1:
                messages.error(request, 'Quantidade inválida.')
            elif quantidade > produto.estoque:
                messages.error(request, f'Apenas {produto.estoque} unidades disponíveis.')
            else:
                carrinho[str(produto_id)]['quantidade'] = quantidade
                request.session['carrinho'] = carrinho
                request.session.modified = True
                messages.success(request, 'Carrinho atualizado.')
        
        return redirect('pedidos:carrinho')
    
    return redirect('core:home')


def remover_carrinho(request, produto_id):
    """View para remover item do carrinho."""
    carrinho = request.session.get('carrinho', {})
    
    if str(produto_id) in carrinho:
        produto = get_object_or_404(Produto, id=produto_id)
        del carrinho[str(produto_id)]
        request.session['carrinho'] = carrinho
        request.session.modified = True
        messages.success(request, f'{produto.nome} removido do carrinho.')
    
    return redirect('pedidos:carrinho')


@login_required
def checkout(request):
    """View para finalização de compra."""
    carrinho = request.session.get('carrinho', {})
    
    if not carrinho:
        messages.warning(request, 'Seu carrinho está vazio.')
        return redirect('produtos:lista')
    
    # Montar estrutura do carrinho
    itens_carrinho = []
    total = Decimal('0.00')
    
    for produto_id, item_data in carrinho.items():
        produto = Produto.objects.get(id=produto_id)
        subtotal = produto.preco_final * item_data['quantidade']
        itens_carrinho.append({
            'produto': produto,
            'quantidade': item_data['quantidade'],
            'subtotal': subtotal,
        })
        total += subtotal
    
    if request.method == 'POST':
        endereco = request.POST.get('endereco')
        cidade = request.POST.get('cidade')
        estado = request.POST.get('estado')
        cep = request.POST.get('cep')
        telefone = request.POST.get('telefone')
        
        # Validar campos
        if not all([endereco, cidade, estado, cep, telefone]):
            messages.error(request, 'Preencha todos os campos de entrega.')
            return render(request, 'pedidos/checkout.html', {
                'itens_carrinho': itens_carrinho,
                'total': total,
            })
        
        try:
            with transaction.atomic():
                # Criar pedido
                pedido = Pedido.objects.create(
                    usuario=request.user,
                    total=total,
                    endereco=endereco,
                    cidade=cidade,
                    estado=estado,
                    cep=cep,
                    telefone=telefone,
                )
                
                # Criar itens do pedido
                for item_data in itens_carrinho:
                    produto = item_data['produto']
                    quantidade = item_data['quantidade']
                    
                    # Verificar estoque
                    if produto.estoque < quantidade:
                        raise ValueError(f'Estoque insuficiente para {produto.nome}')
                    
                    # Criar item
                    ItemPedido.objects.create(
                        pedido=pedido,
                        produto=produto,
                        quantidade=quantidade,
                        preco_unitario=produto.preco_final,
                    )
                    
                    # Atualizar estoque
                    produto.estoque -= quantidade
                    produto.save()
                
                # Limpar carrinho
                request.session['carrinho'] = {}
                request.session.modified = True
                
                messages.success(request, f'Pedido #{pedido.id} realizado com sucesso!')
                return redirect('pedidos:confirmacao', pedido_id=pedido.id)
        
        except Exception as e:
            messages.error(request, f'Erro ao processar pedido: {str(e)}')
    
    context = {
        'itens_carrinho': itens_carrinho,
        'total': total,
    }
    return render(request, 'pedidos/checkout.html', context)


@login_required
def confirmacao(request, pedido_id):
    """View para confirmação de pedido."""
    pedido = get_object_or_404(Pedido, id=pedido_id, usuario=request.user)
    
    context = {
        'pedido': pedido,
    }
    return render(request, 'pedidos/confirmacao.html', context)
