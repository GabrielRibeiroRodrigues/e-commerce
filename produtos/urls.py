from django.urls import path
from . import views

app_name = 'produtos'

urlpatterns = [
    path('', views.lista_produtos, name='lista'),
    path('<slug:slug>/', views.detalhe_produto, name='detalhe'),
    path('avaliacao/<int:produto_id>/', views.adicionar_avaliacao, name='adicionar_avaliacao'),
]
