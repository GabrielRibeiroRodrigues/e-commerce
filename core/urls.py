from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('lgpd/meus-dados/', views.meus_dados_lgpd, name='meus_dados_lgpd'),
    path('lgpd/solicitar/', views.solicitar_dados, name='solicitar_dados'),
    path('lgpd/exportar/', views.exportar_meus_dados, name='exportar_meus_dados'),
    path('lgpd/revogar/<int:consentimento_id>/', views.revogar_consentimento, name='revogar_consentimento'),
    path('politica-privacidade/', views.politica_privacidade, name='politica_privacidade'),
]
