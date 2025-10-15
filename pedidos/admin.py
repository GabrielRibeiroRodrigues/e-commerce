from django.contrib import admin
from .models import Pedido, ItemPedido


class ItemPedidoInline(admin.TabularInline):
    """Inline para exibir itens do pedido."""
    model = ItemPedido
    extra = 0
    readonly_fields = ['produto', 'quantidade', 'preco_unitario', 'subtotal']


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    """Configuração do admin para Pedidos."""
    list_display = [
        'id', 
        'usuario', 
        'status', 
        'total', 
        'criado_em'
    ]
    list_filter = ['status', 'criado_em']
    search_fields = ['usuario__username', 'usuario__email', 'id']
    readonly_fields = ['total', 'criado_em', 'atualizado_em']
    inlines = [ItemPedidoInline]
    fieldsets = (
        ('Informações do Pedido', {
            'fields': ('usuario', 'status', 'total')
        }),
        ('Informações de Entrega', {
            'fields': ('endereco', 'cidade', 'estado', 'cep', 'telefone')
        }),
        ('Datas', {
            'fields': ('criado_em', 'atualizado_em')
        }),
    )
