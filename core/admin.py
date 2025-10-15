from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from django.db.models import Count, Q
from django.template.response import TemplateResponse
import json
import csv
from .models import ConsentimentoLGPD, SolicitacaoDados, LogAcessoDados, PoliticaPrivacidade


@admin.register(ConsentimentoLGPD)
class ConsentimentoLGPDAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'tipo', 'consentido_badge', 'versao_termos', 'data_consentimento', 'ip_address']
    list_filter = ['tipo', 'consentido', 'versao_termos', 'data_consentimento']
    search_fields = ['usuario__username', 'usuario__email', 'ip_address']
    readonly_fields = ['data_consentimento', 'data_revogacao', 'ip_address', 'user_agent']
    date_hierarchy = 'data_consentimento'
    
    fieldsets = (
        ('Informações do Consentimento', {
            'fields': ('usuario', 'tipo', 'consentido', 'versao_termos')
        }),
        ('Dados Técnicos', {
            'fields': ('ip_address', 'user_agent', 'data_consentimento', 'data_revogacao'),
            'classes': ('collapse',)
        }),
    )
    
    def consentido_badge(self, obj):
        if obj.consentido:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">✓ Sim</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">✗ Não</span>'
        )
    consentido_badge.short_description = 'Consentido'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('usuario')


@admin.register(SolicitacaoDados)
class SolicitacaoDadosAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'tipo', 'status_badge', 'data_solicitacao', 'data_conclusao', 'acoes']
    list_filter = ['tipo', 'status', 'data_solicitacao']
    search_fields = ['usuario__username', 'usuario__email', 'descricao']
    readonly_fields = ['data_solicitacao', 'ip_solicitacao', 'usuario', 'tipo', 'descricao']
    date_hierarchy = 'data_solicitacao'
    
    fieldsets = (
        ('Informações da Solicitação', {
            'fields': ('usuario', 'tipo', 'status', 'descricao')
        }),
        ('Processamento', {
            'fields': ('resposta', 'arquivo_resposta', 'processado_por', 'data_processamento', 'data_conclusao')
        }),
        ('Dados Técnicos', {
            'fields': ('ip_solicitacao', 'data_solicitacao'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['marcar_em_analise', 'marcar_processando', 'exportar_dados_usuario']
    
    def status_badge(self, obj):
        colors = {
            'pendente': '#ffc107',
            'em_analise': '#17a2b8',
            'processando': '#007bff',
            'concluida': '#28a745',
            'rejeitada': '#dc3545',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.status, '#6c757d'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def acoes(self, obj):
        if obj.status in ['pendente', 'em_analise', 'processando']:
            url = reverse('admin:core_solicitacaodados_change', args=[obj.pk])
            return format_html(
                '<a class="button" href="{}">Processar</a>',
                url
            )
        return '-'
    acoes.short_description = 'Ações'
    
    def marcar_em_analise(self, request, queryset):
        updated = queryset.filter(status='pendente').update(
            status='em_analise',
            data_processamento=timezone.now(),
            processado_por=request.user
        )
        self.message_user(request, f'{updated} solicitações marcadas como "Em Análise".')
    marcar_em_analise.short_description = 'Marcar como "Em Análise"'
    
    def marcar_processando(self, request, queryset):
        updated = queryset.filter(status='em_analise').update(
            status='processando',
            processado_por=request.user
        )
        self.message_user(request, f'{updated} solicitações marcadas como "Processando".')
    marcar_processando.short_description = 'Marcar como "Processando"'
    
    def exportar_dados_usuario(self, request, queryset):
        """Exporta dados do usuário para atender solicitação de portabilidade."""
        # Esta função seria expandida para gerar JSON/CSV completo dos dados
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="dados_usuarios_lgpd.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Usuário', 'Tipo', 'Status', 'Data Solicitação'])
        
        for solicitacao in queryset:
            writer.writerow([
                solicitacao.usuario.username,
                solicitacao.get_tipo_display(),
                solicitacao.get_status_display(),
                solicitacao.data_solicitacao.strftime('%d/%m/%Y %H:%M')
            ])
        
        return response
    exportar_dados_usuario.short_description = 'Exportar dados das solicitações'
    
    def save_model(self, request, obj, form, change):
        if change and obj.status == 'concluida' and not obj.data_conclusao:
            obj.data_conclusao = timezone.now()
        if not obj.processado_por:
            obj.processado_por = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('usuario', 'processado_por')


@admin.register(LogAcessoDados)
class LogAcessoDadosAdmin(admin.ModelAdmin):
    list_display = ['usuario_titular', 'usuario_operador', 'acao_badge', 'modelo', 'campo', 'data_acesso']
    list_filter = ['acao', 'modelo', 'data_acesso']
    search_fields = ['usuario_titular__username', 'usuario_operador__username', 'modelo', 'campo']
    readonly_fields = ['usuario_titular', 'usuario_operador', 'acao', 'modelo', 'campo', 
                       'valor_anterior', 'valor_novo', 'ip_address', 'justificativa', 'data_acesso']
    date_hierarchy = 'data_acesso'
    
    def has_add_permission(self, request):
        # Logs são apenas de leitura
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Logs não podem ser deletados (auditoria)
        return False
    
    def acao_badge(self, obj):
        colors = {
            'leitura': '#17a2b8',
            'criacao': '#28a745',
            'atualizacao': '#ffc107',
            'exclusao': '#dc3545',
            'exportacao': '#007bff',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.acao, '#6c757d'),
            obj.get_acao_display()
        )
    acao_badge.short_description = 'Ação'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('usuario_titular', 'usuario_operador')


@admin.register(PoliticaPrivacidade)
class PoliticaPrivacidadeAdmin(admin.ModelAdmin):
    list_display = ['versao', 'titulo', 'ativa_badge', 'data_vigencia', 'data_publicacao']
    list_filter = ['ativa', 'data_vigencia', 'data_publicacao']
    search_fields = ['versao', 'titulo', 'conteudo']
    readonly_fields = ['data_publicacao', 'criado_por']
    date_hierarchy = 'data_vigencia'
    
    fieldsets = (
        ('Informações da Política', {
            'fields': ('versao', 'titulo', 'ativa', 'data_vigencia')
        }),
        ('Conteúdo', {
            'fields': ('conteudo',)
        }),
        ('Metadados', {
            'fields': ('data_publicacao', 'criado_por'),
            'classes': ('collapse',)
        }),
    )
    
    def ativa_badge(self, obj):
        if obj.ativa:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">✓ Ativa</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Inativa</span>'
        )
    ativa_badge.short_description = 'Status'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.criado_por = request.user
        super().save_model(request, obj, form, change)


# Customização do Admin Site para adicionar dashboard LGPD
class LGPDAdminSite(admin.AdminSite):
    site_header = 'Administração LGPD - Farmácia QUEOPS'
    site_title = 'Admin LGPD'
    index_title = 'Painel de Conformidade LGPD/GDPR'
    
    def index(self, request, extra_context=None):
        """Dashboard customizado com relatórios LGPD."""
        extra_context = extra_context or {}
        
        # Estatísticas
        total_consentimentos = ConsentimentoLGPD.objects.count()
        consentimentos_ativos = ConsentimentoLGPD.objects.filter(consentido=True).count()
        
        solicitacoes_pendentes = SolicitacaoDados.objects.filter(status='pendente').count()
        solicitacoes_total = SolicitacaoDados.objects.count()
        
        logs_ultimos_30_dias = LogAcessoDados.objects.filter(
            data_acesso__gte=timezone.now() - timezone.timedelta(days=30)
        ).count()
        
        politica_ativa = PoliticaPrivacidade.objects.filter(ativa=True).first()
        
        # Gráfico de solicitações por tipo
        solicitacoes_por_tipo = list(
            SolicitacaoDados.objects.values('tipo')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        
        # Consentimentos por tipo
        consentimentos_por_tipo = list(
            ConsentimentoLGPD.objects.values('tipo')
            .annotate(
                consentidos=Count('id', filter=Q(consentido=True)),
                total=Count('id')
            )
            .order_by('-total')
        )
        
        extra_context.update({
            'total_consentimentos': total_consentimentos,
            'consentimentos_ativos': consentimentos_ativos,
            'taxa_consentimento': round(consentimentos_ativos / total_consentimentos * 100 if total_consentimentos > 0 else 0, 1),
            'solicitacoes_pendentes': solicitacoes_pendentes,
            'solicitacoes_total': solicitacoes_total,
            'logs_ultimos_30_dias': logs_ultimos_30_dias,
            'politica_ativa': politica_ativa,
            'solicitacoes_por_tipo': json.dumps(solicitacoes_por_tipo),
            'consentimentos_por_tipo': json.dumps(consentimentos_por_tipo),
        })
        
        return super().index(request, extra_context)
