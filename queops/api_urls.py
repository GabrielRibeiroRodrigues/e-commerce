from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.api_views import HomeView
from produtos.api_views import CategoriaListView, ProdutoListView, ProdutoDetailView, AvaliacaoCreateView
from usuarios.api_views import RegistroView, PerfilView, ListaDesejoListView, ListaDesejoDetalheView
from pedidos.api_views import (
    CarrinhoView,
    CarrinhoItemView,
    FreteCalcularView,
    CheckoutView,
    PedidoListView,
    PedidoDetailView,
)

urlpatterns = [
    # Home
    path('home/', HomeView.as_view()),

    # Auth
    path('auth/registro/', RegistroView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),

    # Perfil
    path('perfil/', PerfilView.as_view()),

    # Lista de desejos
    path('desejos/', ListaDesejoListView.as_view()),
    path('desejos/<int:produto_id>/', ListaDesejoDetalheView.as_view()),

    # Produtos
    path('categorias/', CategoriaListView.as_view()),
    path('produtos/', ProdutoListView.as_view()),
    path('produtos/<slug:slug>/', ProdutoDetailView.as_view()),
    path('produtos/<int:produto_id>/avaliacao/', AvaliacaoCreateView.as_view()),

    # Carrinho
    path('carrinho/', CarrinhoView.as_view()),
    path('carrinho/<int:produto_id>/', CarrinhoItemView.as_view()),

    # Frete
    path('frete/calcular/', FreteCalcularView.as_view()),

    # Checkout e pedidos
    path('checkout/', CheckoutView.as_view()),
    path('pedidos/', PedidoListView.as_view()),
    path('pedidos/<int:pk>/', PedidoDetailView.as_view()),
]
