from django.contrib import admin
from .models import Pedido, ItemPedido, Pagamento


class ItemPedidoInline(admin.TabularInline):
    """Inline para exibir itens do pedido."""
    model = ItemPedido
    extra = 0
    readonly_fields = ['produto', 'quantidade', 'preco_unitario', 'subtotal']


class PagamentoInline(admin.StackedInline):
    """Inline para exibir informações de pagamento."""
    model = Pagamento
    extra = 0
    can_delete = False
    readonly_fields = [
        'metodo',
        'status',
        'valor',
        'transacao_id',
        'codigo_confirmacao',
        'mensagem_retorno',
        'cartao_final',
        'nome_portador',
        'criado_em',
        'atualizado_em',
    ]


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    """Configuração do admin para Pedidos."""
    list_display = [
        'id', 
        'usuario', 
        'status', 
        'total',
        'valor_frete',
        'criado_em'
    ]
    list_filter = ['status', 'criado_em']
    search_fields = ['usuario__username', 'usuario__email', 'id']
    readonly_fields = ['total', 'valor_frete', 'criado_em', 'atualizado_em']
    inlines = [ItemPedidoInline, PagamentoInline]
    fieldsets = (
        ('Informações do Pedido', {
            'fields': ('usuario', 'status', 'total', 'valor_frete')
        }),
        ('Informações de Entrega', {
            'fields': ('endereco', 'cidade', 'estado', 'cep', 'telefone')
        }),
        ('Datas', {
            'fields': ('criado_em', 'atualizado_em')
        }),
    )
    
    def get_queryset(self, request):
        """Otimiza queries do admin."""
        qs = super().get_queryset(request)
        return qs.select_related('usuario').prefetch_related('itens__produto', 'pagamento')


@admin.register(Pagamento)
class PagamentoAdmin(admin.ModelAdmin):
    """Configuração do admin para Pagamentos."""

    list_display = [
        'id',
        'pedido',
        'metodo',
        'status',
        'valor',
        'criado_em',
    ]
    list_filter = ['metodo', 'status', 'criado_em']
    search_fields = ['pedido__id', 'pedido__usuario__username', 'transacao_id']
    readonly_fields = [
        'pedido',
        'metodo',
        'status',
        'valor',
        'transacao_id',
        'codigo_confirmacao',
        'mensagem_retorno',
        'cartao_final',
        'nome_portador',
        'criado_em',
        'atualizado_em',
    ]

