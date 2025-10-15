from django.contrib import admin

from .models import ListaDesejo, ContaSocial


@admin.register(ListaDesejo)
class ListaDesejoAdmin(admin.ModelAdmin):
	"""Admin da lista de desejos."""
	list_display = ['usuario', 'produto', 'criado_em']
	search_fields = ['usuario__username', 'produto__nome']
	list_filter = ['criado_em']


@admin.register(ContaSocial)
class ContaSocialAdmin(admin.ModelAdmin):
	"""Admin das contas sociais vinculadas."""
	list_display = ['usuario', 'provedor', 'email', 'criado_em']
	search_fields = ['usuario__username', 'email', 'external_id']
	list_filter = ['provedor', 'criado_em']
	readonly_fields = ['usuario', 'provedor', 'external_id', 'email', 'criado_em', 'atualizado_em']
