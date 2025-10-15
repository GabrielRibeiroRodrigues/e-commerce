from django.urls import path
from . import views

app_name = 'pedidos'

urlpatterns = [
    path('carrinho/', views.carrinho, name='carrinho'),
    path('adicionar/<int:produto_id>/', views.adicionar_carrinho, name='adicionar_carrinho'),
    path('atualizar/<int:produto_id>/', views.atualizar_carrinho, name='atualizar_carrinho'),
    path('remover/<int:produto_id>/', views.remover_carrinho, name='remover_carrinho'),
    path('checkout/', views.checkout, name='checkout'),
    path('confirmacao/<int:pedido_id>/', views.confirmacao, name='confirmacao'),
]
