from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    path('registro/', views.registro, name='registro'),
    path('login/', views.login_view, name='login'),
    path('login/google/', views.login_google, name='login_google'),
    path('login/google/callback/', views.login_google_callback, name='login_google_callback'),
    path('logout/', views.logout_view, name='logout'),
    path('perfil/', views.perfil, name='perfil'),
    path('desejos/', views.lista_desejos, name='lista_desejos'),
    path('desejos/adicionar/<int:produto_id>/', views.adicionar_lista_desejos, name='adicionar_desejo'),
    path('desejos/remover/<int:produto_id>/', views.remover_lista_desejos, name='remover_desejo'),
]
