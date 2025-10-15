import re
from decimal import Decimal

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from produtos.models import Produto
from .models import Pedido, ItemPedido, Pagamento
from .services import processar_pagamento, PagamentoErro


def calcular_frete_por_cep(cep: str) -> Decimal:
    """Calcula um valor de frete estimado com base no CEP informado."""
    cep_limpo = re.sub(r'\D', '', cep or '')

    if len(cep_limpo) != 8:
        raise ValueError('Informe um CEP válido com 8 dígitos.')

    prefixo = int(cep_limpo[:2])

    if 0 <= prefixo <= 19:
        # Sudeste: menor custo
        return Decimal('14.90')
    if 20 <= prefixo <= 29:
        # Sul
        return Decimal('19.90')
    if 30 <= prefixo <= 59:
        # Centro-Oeste e Nordeste
        return Decimal('24.90')
    if 60 <= prefixo <= 79:
        # Norte
        return Decimal('29.90')

    # Faixa final – regiões mais remotas
    return Decimal('34.90')


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
    
    checkout_info = request.session.get('checkout_info', {})
    valor_frete = checkout_info.get('valor_frete')
    valor_frete_decimal = Decimal(valor_frete) if valor_frete else None
    total_geral = total + valor_frete_decimal if valor_frete_decimal is not None else total

    context = {
        'itens_carrinho': itens_carrinho,
        'total': total,
        'valor_frete': valor_frete_decimal,
        'total_geral': total_geral,
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
    
    checkout_info = request.session.get('checkout_info', {})
    valor_frete = Decimal(checkout_info.get('valor_frete')) if checkout_info.get('valor_frete') else None

    form_data = {
        'endereco': '',
        'cidade': '',
        'estado': '',
        'cep': checkout_info.get('cep', ''),
        'telefone': '',
    }

    pagamento_data = {
        'metodo_pagamento': 'cartao_credito',
        'numero_cartao': '',
        'nome_portador': '',
        'validade': '',
        'cvv': '',
    }

    if request.method == 'POST':
        form_data.update({
            'endereco': request.POST.get('endereco', '').strip(),
            'cidade': request.POST.get('cidade', '').strip(),
            'estado': request.POST.get('estado', '').strip(),
            'cep': request.POST.get('cep', '').strip(),
            'telefone': request.POST.get('telefone', '').strip(),
        })

        pagamento_data.update({
            'metodo_pagamento': request.POST.get('metodo_pagamento', 'cartao_credito'),
            'numero_cartao': request.POST.get('numero_cartao', '').strip(),
            'nome_portador': request.POST.get('nome_portador', '').strip(),
            'validade': request.POST.get('validade', '').strip(),
            'cvv': request.POST.get('cvv', '').strip(),
        })

        if 'calcular_frete' in request.POST:
            try:
                valor_frete = calcular_frete_por_cep(form_data['cep'])
                request.session['checkout_info'] = {
                    'cep': form_data['cep'],
                    'valor_frete': str(valor_frete),
                }
                request.session.modified = True
                messages.success(request, f'Frete calculado: R$ {valor_frete}')
            except ValueError as exc:
                valor_frete = None
                request.session['checkout_info'] = {}
                request.session.modified = True
                messages.error(request, str(exc))

            context = {
                'itens_carrinho': itens_carrinho,
                'total': total,
                'valor_frete': valor_frete,
                'total_geral': total + (valor_frete or Decimal('0')),
                'form_data': form_data,
                'pagamento_data': pagamento_data,
            }
            return render(request, 'pedidos/checkout.html', context)

        if 'finalizar_pedido' in request.POST:
            if not all([form_data['endereco'], form_data['cidade'], form_data['estado'], form_data['cep'], form_data['telefone']]):
                messages.error(request, 'Preencha todos os campos de entrega.')
            else:
                try:
                    valor_frete = calcular_frete_por_cep(form_data['cep'])
                except ValueError as exc:
                    messages.error(request, str(exc))
                else:
                    valor_total_com_frete = total + valor_frete
                    metodo_pagamento = pagamento_data['metodo_pagamento']
                    dados_pagamento = {
                        'numero_cartao': pagamento_data['numero_cartao'],
                        'nome_portador': pagamento_data['nome_portador'],
                        'validade': pagamento_data['validade'],
                        'cvv': pagamento_data['cvv'],
                    }

                    try:
                        resultado_pagamento = processar_pagamento(
                            valor_total_com_frete,
                            metodo_pagamento,
                            dados_pagamento
                        )
                    except PagamentoErro as exc:
                        messages.error(request, str(exc))
                        resultado_pagamento = None
                    else:
                        if resultado_pagamento.get('status') == 'recusado':
                            messages.error(
                                request,
                                resultado_pagamento.get('mensagem', 'Pagamento não autorizado.')
                            )
                            resultado_pagamento = None

                    if resultado_pagamento is not None:
                        try:
                            with transaction.atomic():
                                pedido = Pedido.objects.create(
                                    usuario=request.user,
                                    total=total,
                                    valor_frete=valor_frete,
                                    endereco=form_data['endereco'],
                                    cidade=form_data['cidade'],
                                    estado=form_data['estado'],
                                    cep=form_data['cep'],
                                    telefone=form_data['telefone'],
                                )

                                for item_data in itens_carrinho:
                                    produto = item_data['produto']
                                    quantidade = item_data['quantidade']

                                    if produto.estoque < quantidade:
                                        raise ValueError(f'Estoque insuficiente para {produto.nome}')

                                    ItemPedido.objects.create(
                                        pedido=pedido,
                                        produto=produto,
                                        quantidade=quantidade,
                                        preco_unitario=produto.preco_final,
                                    )

                                    produto.estoque -= quantidade
                                    produto.save()

                                Pagamento.objects.create(
                                    pedido=pedido,
                                    metodo=metodo_pagamento,
                                    status=resultado_pagamento.get('status', 'pendente'),
                                    valor=valor_total_com_frete,
                                    transacao_id=resultado_pagamento.get('transacao_id', ''),
                                    codigo_confirmacao=resultado_pagamento.get('codigo_confirmacao', ''),
                                    mensagem_retorno=resultado_pagamento.get('mensagem', ''),
                                    cartao_final=resultado_pagamento.get('cartao_final', ''),
                                    nome_portador=resultado_pagamento.get('nome_portador', ''),
                                )

                                if resultado_pagamento.get('status') == 'autorizado' and pedido.status != 'processando':
                                    pedido.status = 'processando'
                                    pedido.save(update_fields=['status'])

                                request.session['carrinho'] = {}
                                request.session['checkout_info'] = {}
                                request.session.modified = True

                        except Exception as exc:
                            messages.error(request, f'Erro ao processar pedido: {str(exc)}')
                        else:
                            messages.success(request, f'Pedido #{pedido.id} realizado com sucesso!')
                            if metodo_pagamento == 'boleto':
                                messages.info(
                                    request,
                                    'Boleto gerado com sucesso. O pedido ficará pendente até a compensação.'
                                )
                            if metodo_pagamento == 'pix':
                                messages.info(
                                    request,
                                    'Pagamento via Pix confirmado. Você receberá o comprovante por e-mail.'
                                )
                            return redirect('pedidos:confirmacao', pedido_id=pedido.id)

        # Se chegou aqui, houve erro de validação
        context = {
            'itens_carrinho': itens_carrinho,
            'total': total,
            'valor_frete': valor_frete,
            'total_geral': total + (valor_frete or Decimal('0')),
            'form_data': form_data,
            'pagamento_data': pagamento_data,
        }
        return render(request, 'pedidos/checkout.html', context)

    context = {
        'itens_carrinho': itens_carrinho,
        'total': total,
        'valor_frete': valor_frete,
        'total_geral': total + (valor_frete or Decimal('0')),
        'form_data': form_data,
        'pagamento_data': pagamento_data,
    }
    return render(request, 'pedidos/checkout.html', context)


@login_required
def confirmacao(request, pedido_id):
    """View para confirmação de pedido."""
    pedido = get_object_or_404(Pedido, id=pedido_id, usuario=request.user)
    try:
        pagamento = pedido.pagamento
    except Pagamento.DoesNotExist:
        pagamento = None
    
    context = {
        'pedido': pedido,
        'pagamento': pagamento,
    }
    return render(request, 'pedidos/confirmacao.html', context)
