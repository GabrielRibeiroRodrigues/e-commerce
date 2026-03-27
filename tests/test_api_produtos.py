"""Testes de integração — endpoints de produtos."""
import pytest
from decimal import Decimal
from tests.factories import ProdutoFactory, CategoriaFactory, AvaliacaoFactory, UserFactory


@pytest.mark.django_db
class TestCategoriaAPI:
    def test_lista_categorias(self, api_client):
        CategoriaFactory.create_batch(3)
        res = api_client.get('/api/categorias/')
        assert res.status_code == 200
        assert res.data['count'] == 3

    def test_categoria_tem_campos_esperados(self, api_client):
        CategoriaFactory(nome='Medicamentos')
        res = api_client.get('/api/categorias/')
        item = res.data['results'][0]
        assert 'id' in item
        assert 'nome' in item
        assert 'slug' in item


@pytest.mark.django_db
class TestProdutoListAPI:
    def test_lista_produtos_ativos(self, api_client):
        ProdutoFactory.create_batch(3, ativo=True)
        ProdutoFactory(ativo=False)
        res = api_client.get('/api/produtos/')
        assert res.status_code == 200
        assert res.data['count'] == 3

    def test_busca_por_nome(self, api_client):
        ProdutoFactory(nome='Dipirona 500mg')
        ProdutoFactory(nome='Vitamina C')
        res = api_client.get('/api/produtos/?q=dipirona')
        assert res.status_code == 200
        assert res.data['count'] == 1
        assert res.data['results'][0]['nome'] == 'Dipirona 500mg'

    def test_filtra_por_categoria(self, api_client):
        cat = CategoriaFactory(nome='Vitaminas', slug='vitaminas')
        ProdutoFactory(categoria=cat)
        ProdutoFactory()
        res = api_client.get('/api/produtos/?categoria=vitaminas')
        assert res.status_code == 200
        assert res.data['count'] == 1

    def test_filtra_destaques(self, api_client):
        ProdutoFactory(destaque=True)
        ProdutoFactory(destaque=False)
        res = api_client.get('/api/produtos/?destaque=true')
        assert res.status_code == 200
        assert res.data['count'] == 1

    def test_filtra_promocoes(self, api_client):
        ProdutoFactory(preco=Decimal('50.00'), preco_promocional=Decimal('35.00'))
        ProdutoFactory(preco_promocional=None)
        res = api_client.get('/api/produtos/?promocao=true')
        assert res.status_code == 200
        assert res.data['count'] == 1

    def test_produto_tem_campos_esperados(self, api_client):
        ProdutoFactory()
        res = api_client.get('/api/produtos/')
        item = res.data['results'][0]
        for campo in ['id', 'nome', 'slug', 'preco', 'preco_final', 'disponivel', 'categoria']:
            assert campo in item


@pytest.mark.django_db
class TestProdutoDetalheAPI:
    def test_detalhe_por_slug(self, api_client):
        produto = ProdutoFactory(nome='Omega 3')
        res = api_client.get(f'/api/produtos/{produto.slug}/')
        assert res.status_code == 200
        assert res.data['nome'] == 'Omega 3'
        assert 'descricao' in res.data
        assert 'avaliacoes' in res.data

    def test_produto_inativo_retorna_404(self, api_client):
        produto = ProdutoFactory(ativo=False)
        res = api_client.get(f'/api/produtos/{produto.slug}/')
        assert res.status_code == 404

    def test_slug_inexistente_retorna_404(self, api_client):
        res = api_client.get('/api/produtos/nao-existe/')
        assert res.status_code == 404


@pytest.mark.django_db
class TestAvaliacaoAPI:
    def test_avaliacao_requer_autenticacao(self, api_client):
        produto = ProdutoFactory()
        res = api_client.post(f'/api/produtos/{produto.id}/avaliacao/', {'rating': 5})
        assert res.status_code == 401

    def test_criar_avaliacao(self, api_autenticado):
        produto = ProdutoFactory()
        res = api_autenticado.post(
            f'/api/produtos/{produto.id}/avaliacao/',
            {'rating': 4, 'comentario': 'Ótimo produto!'},
        )
        assert res.status_code == 201
        assert res.data['rating'] == 4

    def test_avaliacao_duplicada_retorna_400(self, api_autenticado, usuario):
        produto = ProdutoFactory()
        AvaliacaoFactory(produto=produto, usuario=usuario)
        res = api_autenticado.post(f'/api/produtos/{produto.id}/avaliacao/', {'rating': 3})
        assert res.status_code == 400

    def test_rating_invalido_retorna_400(self, api_autenticado):
        produto = ProdutoFactory()
        res = api_autenticado.post(f'/api/produtos/{produto.id}/avaliacao/', {'rating': 6})
        assert res.status_code == 400
