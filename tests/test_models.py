"""Testes unitários dos models."""
import pytest
from decimal import Decimal
from tests.factories import (
    ProdutoFactory, CategoriaFactory, AvaliacaoFactory,
    UserFactory, PedidoFactory, ItemPedidoFactory, CarrinhoItem,
)


@pytest.mark.django_db
class TestProdutoModel:
    def test_slug_gerado_automaticamente(self):
        produto = ProdutoFactory(nome='Dipirona 500mg')
        assert produto.slug == 'dipirona-500mg'

    def test_preco_final_sem_promocao(self):
        produto = ProdutoFactory(preco=Decimal('29.90'), preco_promocional=None)
        assert produto.preco_final == Decimal('29.90')

    def test_preco_final_com_promocao(self):
        produto = ProdutoFactory(preco=Decimal('29.90'), preco_promocional=Decimal('19.90'))
        assert produto.preco_final == Decimal('19.90')

    def test_tem_promocao_verdadeiro(self):
        produto = ProdutoFactory(preco=Decimal('50.00'), preco_promocional=Decimal('35.00'))
        assert produto.tem_promocao is True

    def test_tem_promocao_falso_sem_preco_promo(self):
        produto = ProdutoFactory(preco_promocional=None)
        assert produto.tem_promocao is False

    def test_disponivel_com_estoque(self):
        produto = ProdutoFactory(ativo=True, estoque=5)
        assert produto.disponivel is True

    def test_indisponivel_sem_estoque(self):
        produto = ProdutoFactory(ativo=True, estoque=0)
        assert produto.disponivel is False

    def test_indisponivel_inativo(self):
        produto = ProdutoFactory(ativo=False, estoque=10)
        assert produto.disponivel is False

    def test_media_avaliacoes_sem_avaliacoes(self):
        produto = ProdutoFactory()
        assert produto.media_avaliacoes == 0

    def test_media_avaliacoes_com_avaliacoes(self):
        produto = ProdutoFactory()
        AvaliacaoFactory(produto=produto, rating=4)
        AvaliacaoFactory(produto=produto, rating=2)
        assert produto.media_avaliacoes == 3.0

    def test_total_avaliacoes(self):
        produto = ProdutoFactory()
        AvaliacaoFactory(produto=produto)
        AvaliacaoFactory(produto=produto, usuario=UserFactory())
        assert produto.total_avaliacoes == 2

    def test_str(self):
        produto = ProdutoFactory(nome='Vitamina C')
        assert str(produto) == 'Vitamina C'


@pytest.mark.django_db
class TestCategoriaModel:
    def test_slug_gerado_automaticamente(self):
        cat = CategoriaFactory(nome='Vitaminas e Suplementos')
        assert cat.slug == 'vitaminas-e-suplementos'

    def test_str(self):
        cat = CategoriaFactory(nome='Medicamentos')
        assert str(cat) == 'Medicamentos'


@pytest.mark.django_db
class TestPedidoModel:
    def test_total_com_frete(self):
        pedido = PedidoFactory(total=Decimal('100.00'), valor_frete=Decimal('14.90'))
        assert pedido.total_com_frete == Decimal('114.90')

    def test_str(self):
        usuario = UserFactory(username='joao')
        pedido = PedidoFactory(usuario=usuario)
        assert f'Pedido #{pedido.id}' in str(pedido)
        assert 'joao' in str(pedido)


@pytest.mark.django_db
class TestItemPedidoModel:
    def test_subtotal(self):
        item = ItemPedidoFactory(quantidade=3, preco_unitario=Decimal('10.00'))
        assert item.subtotal == Decimal('30.00')
