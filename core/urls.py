from django.urls import path
from . import views
from . import admin_views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('lgpd/meus-dados/', views.meus_dados_lgpd, name='meus_dados_lgpd'),
    path('lgpd/solicitar/', views.solicitar_dados, name='solicitar_dados'),
    path('lgpd/exportar/', views.exportar_meus_dados, name='exportar_meus_dados'),
    path('lgpd/revogar/<int:consentimento_id>/', views.revogar_consentimento, name='revogar_consentimento'),
    path('politica-privacidade/', views.politica_privacidade, name='politica_privacidade'),
    
    # Admin Dashboard e Relatórios
    path('admin-dashboard/', admin_views.dashboard_admin, name='dashboard_admin'),
    path('admin-relatorios/vendas/', admin_views.relatorio_vendas, name='relatorio_vendas'),
    path('admin-relatorios/estoque/', admin_views.relatorio_estoque, name='relatorio_estoque'),
    path('admin-relatorios/usuarios/', admin_views.relatorio_usuarios, name='relatorio_usuarios'),
    path('admin-relatorios/exportar-vendas/', admin_views.exportar_vendas_csv, name='exportar_vendas_csv'),
    path('admin-relatorios/exportar-estoque/', admin_views.exportar_estoque_csv, name='exportar_estoque_csv'),
]
