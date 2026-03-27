import logging
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from pedidos import services as payment_services
from .models import CarrinhoItem, Pedido, ItemPedido, Pagamento
from .serializers import (
    CarrinhoItemSerializer,
    CarrinhoAdicaoSerializer,
    CarrinhoAtualizacaoSerializer,
    FreteSerializer,
    CheckoutSerializer,
    PedidoSerializer,
)
from .services.carrinho_service import CarrinhoService
from .views import calcular_frete_por_cep

logger = logging.getLogger(__name__)


class CarrinhoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        itens = CarrinhoService.get_carrinho(request)
        serializer = CarrinhoItemSerializer(itens, many=True, context={'request': request})
        total = CarrinhoService.get_total(request)
        return Response({
            'itens': serializer.data,
            'total': total,
            'quantidade_total': CarrinhoService.get_quantidade_total(request),
        })

    def post(self, request):
        serializer = CarrinhoAdicaoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = CarrinhoService.adicionar_produto(
                request,
                serializer.validated_data['produto_id'],
                serializer.validated_data['quantidade'],
            )
        except ValidationError as e:
            return Response({'detail': e.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            CarrinhoItemSerializer(item, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class CarrinhoItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, produto_id):
        serializer = CarrinhoAtualizacaoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = CarrinhoService.atualizar_quantidade(
                request, produto_id, serializer.validated_data['quantidade']
            )
        except ValidationError as e:
            return Response({'detail': e.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(CarrinhoItemSerializer(item, context={'request': request}).data)

    def delete(self, request, produto_id):
        try:
            CarrinhoService.remover_produto(request, produto_id)
        except ValidationError as e:
            return Response({'detail': e.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FreteCalcularView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FreteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            valor = calcular_frete_por_cep(serializer.validated_data['cep'])
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'cep': serializer.validated_data['cep'], 'valor_frete': valor})


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        itens = CarrinhoService.get_carrinho(request)

        if not itens.exists():
            return Response({'detail': 'O carrinho está vazio.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            valor_frete = calcular_frete_por_cep(data['cep'])
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        total_produtos = CarrinhoService.get_total(request)

        dados_pagamento = {
            'numero_cartao': data.get('numero_cartao', ''),
            'nome_portador': data.get('nome_portador', ''),
            'validade': data.get('validade', ''),
            'cvv': data.get('cvv', ''),
        }

        try:
            with transaction.atomic():
                pedido = Pedido.objects.create(
                    usuario=request.user,
                    total=total_produtos,
                    valor_frete=valor_frete,
                    endereco=data['endereco'],
                    cidade=data['cidade'],
                    estado=data['estado'],
                    cep=data['cep'],
                    telefone=data['telefone'],
                )

                for item in itens:
                    ItemPedido.objects.create(
                        pedido=pedido,
                        produto=item.produto,
                        quantidade=item.quantidade,
                        preco_unitario=item.produto.preco_final,
                    )
                    item.produto.estoque -= item.quantidade
                    item.produto.save()

                resultado = payment_services.processar_pagamento(
                    valor=total_produtos + valor_frete,
                    metodo=data['metodo_pagamento'],
                    dados=dados_pagamento,
                )

                Pagamento.objects.create(
                    pedido=pedido,
                    metodo=data['metodo_pagamento'],
                    status=resultado['status'],
                    valor=total_produtos + valor_frete,
                    transacao_id=resultado.get('transacao_id', ''),
                    codigo_confirmacao=resultado.get('codigo_confirmacao', ''),
                    mensagem_retorno=resultado.get('mensagem', ''),
                    cartao_final=resultado.get('cartao_final', ''),
                    nome_portador=resultado.get('nome_portador', ''),
                )

                CarrinhoService.limpar_carrinho(request)

        except payment_services.PagamentoErro as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception('Erro ao processar checkout: %s', e)
            return Response(
                {'detail': 'Erro ao processar o pedido. Tente novamente.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)


class PedidoListView(generics.ListAPIView):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pedido.objects.filter(
            usuario=self.request.user
        ).prefetch_related('itens__produto', 'pagamento')


class PedidoDetailView(generics.RetrieveAPIView):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pedido.objects.filter(
            usuario=self.request.user
        ).prefetch_related('itens__produto', 'pagamento')
