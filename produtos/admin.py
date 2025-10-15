from django.contrib import admin
from .models import Categoria, Produto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    """Configuração do admin para Categorias."""
    list_display = ['nome', 'slug', 'criado_em']
    search_fields = ['nome', 'descricao']
    prepopulated_fields = {'slug': ('nome',)}
    readonly_fields = ['criado_em', 'atualizado_em']


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    """Configuração do admin para Produtos."""
    list_display = [
        'nome', 
        'categoria', 
        'preco', 
        'preco_promocional', 
        'estoque', 
        'ativo', 
        'destaque'
    ]
    list_filter = ['categoria', 'ativo', 'destaque', 'criado_em']
    search_fields = ['nome', 'descricao']
    prepopulated_fields = {'slug': ('nome',)}
    list_editable = ['preco', 'preco_promocional', 'estoque', 'ativo', 'destaque']
    readonly_fields = ['criado_em', 'atualizado_em']
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'slug', 'descricao', 'categoria')
        }),
        ('Preços e Estoque', {
            'fields': ('preco', 'preco_promocional', 'estoque')
        }),
        ('Imagem', {
            'fields': ('imagem',)
        }),
        ('Status', {
            'fields': ('ativo', 'destaque')
        }),
        ('Datas', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Otimiza queries do admin."""
        qs = super().get_queryset(request)
        return qs.select_related('categoria')
