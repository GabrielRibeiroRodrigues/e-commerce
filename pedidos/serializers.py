from rest_framework import serializers

from produtos.serializers import ProdutoListSerializer
from .models import CarrinhoItem, Pedido, ItemPedido, Pagamento


class CarrinhoItemSerializer(serializers.ModelSerializer):
    produto = ProdutoListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CarrinhoItem
        fields = ['id', 'produto', 'quantidade', 'subtotal']


class CarrinhoAdicaoSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1, default=1)


class CarrinhoAtualizacaoSerializer(serializers.Serializer):
    quantidade = serializers.IntegerField(min_value=1)


class FreteSerializer(serializers.Serializer):
    cep = serializers.CharField(max_length=9)


class PagamentoSerializer(serializers.ModelSerializer):
    metodo_display = serializers.CharField(source='get_metodo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Pagamento
        fields = [
            'id', 'metodo', 'metodo_display', 'status', 'status_display',
            'valor', 'transacao_id', 'codigo_confirmacao', 'mensagem_retorno',
            'cartao_final', 'nome_portador', 'criado_em',
        ]


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_slug = serializers.CharField(source='produto.slug', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ItemPedido
        fields = ['id', 'produto_nome', 'produto_slug', 'quantidade', 'preco_unitario', 'subtotal']


class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True, read_only=True)
    pagamento = PagamentoSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_com_frete = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'status', 'status_display', 'total', 'valor_frete', 'total_com_frete',
            'endereco', 'cidade', 'estado', 'cep', 'telefone',
            'itens', 'pagamento', 'criado_em',
        ]


class CheckoutSerializer(serializers.Serializer):
    # Entrega
    endereco = serializers.CharField(max_length=255)
    cidade = serializers.CharField(max_length=100)
    estado = serializers.CharField(max_length=2, min_length=2)
    cep = serializers.CharField(max_length=9)
    telefone = serializers.CharField(max_length=15)

    # Pagamento
    metodo_pagamento = serializers.ChoiceField(choices=['cartao_credito', 'pix', 'boleto'])

    # Dados do cartão (obrigatórios apenas para cartão de crédito)
    numero_cartao = serializers.CharField(max_length=19, required=False, allow_blank=True)
    nome_portador = serializers.CharField(max_length=150, required=False, allow_blank=True)
    validade = serializers.CharField(max_length=5, required=False, allow_blank=True)
    cvv = serializers.CharField(max_length=4, required=False, allow_blank=True)

    def validate(self, data):
        if data.get('metodo_pagamento') == 'cartao_credito':
            campos_cartao = ['numero_cartao', 'nome_portador', 'validade', 'cvv']
            for campo in campos_cartao:
                if not data.get(campo):
                    raise serializers.ValidationError({campo: 'Este campo é obrigatório para pagamento com cartão.'})
        return data
