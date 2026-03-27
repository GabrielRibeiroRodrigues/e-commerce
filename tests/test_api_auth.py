"""Testes de integração — endpoints de autenticação e usuário."""
import pytest
from tests.factories import UserFactory, ProdutoFactory
from usuarios.models import ListaDesejo


@pytest.mark.django_db
class TestRegistroAPI:
    PAYLOAD = {
        'username': 'novouser',
        'email': 'novo@example.com',
        'first_name': 'Novo',
        'last_name': 'User',
        'password': 'SenhaForte123!',
        'password2': 'SenhaForte123!',
    }

    def test_registro_sucesso(self, api_client):
        res = api_client.post('/api/auth/registro/', self.PAYLOAD)
        assert res.status_code == 201
        assert res.data['detail'] == 'Conta criada com sucesso.'

    def test_registro_email_duplicado(self, api_client, usuario):
        payload = {**self.PAYLOAD, 'email': usuario.email, 'username': 'outro'}
        res = api_client.post('/api/auth/registro/', payload)
        assert res.status_code == 400
        assert 'email' in res.data

    def test_registro_senhas_diferentes(self, api_client):
        payload = {**self.PAYLOAD, 'password2': 'SenhaDiferente!'}
        res = api_client.post('/api/auth/registro/', payload)
        assert res.status_code == 400

    def test_registro_username_duplicado(self, api_client, usuario):
        payload = {**self.PAYLOAD, 'username': usuario.username}
        res = api_client.post('/api/auth/registro/', payload)
        assert res.status_code == 400


@pytest.mark.django_db
class TestLoginAPI:
    def test_login_retorna_tokens(self, api_client, usuario):
        res = api_client.post('/api/auth/login/', {
            'username': usuario.username,
            'password': 'senha123',
        })
        assert res.status_code == 200
        assert 'access' in res.data
        assert 'refresh' in res.data

    def test_login_credenciais_erradas(self, api_client):
        res = api_client.post('/api/auth/login/', {
            'username': 'naoexiste',
            'password': 'errado',
        })
        assert res.status_code == 401

    def test_refresh_token(self, api_client, usuario):
        login = api_client.post('/api/auth/login/', {
            'username': usuario.username,
            'password': 'senha123',
        })
        res = api_client.post('/api/auth/refresh/', {'refresh': login.data['refresh']})
        assert res.status_code == 200
        assert 'access' in res.data


@pytest.mark.django_db
class TestPerfilAPI:
    def test_perfil_requer_autenticacao(self, api_client):
        res = api_client.get('/api/perfil/')
        assert res.status_code == 401

    def test_get_perfil(self, api_autenticado, usuario):
        res = api_autenticado.get('/api/perfil/')
        assert res.status_code == 200
        assert res.data['username'] == usuario.username
        assert res.data['email'] == usuario.email

    def test_atualizar_perfil(self, api_autenticado):
        res = api_autenticado.put('/api/perfil/', {
            'first_name': 'Novo',
            'last_name': 'Nome',
            'email': 'atualizado@example.com',
        })
        assert res.status_code == 200
        assert res.data['first_name'] == 'Novo'
        assert res.data['email'] == 'atualizado@example.com'


@pytest.mark.django_db
class TestWishlistAPI:
    def test_wishlist_requer_autenticacao(self, api_client):
        res = api_client.get('/api/desejos/')
        assert res.status_code == 401

    def test_adicionar_a_wishlist(self, api_autenticado, usuario):
        produto = ProdutoFactory()
        res = api_autenticado.post('/api/desejos/', {'produto_id': produto.id})
        assert res.status_code == 201
        assert ListaDesejo.objects.filter(usuario=usuario, produto=produto).exists()

    def test_adicionar_duplicado_retorna_400(self, api_autenticado, usuario):
        produto = ProdutoFactory()
        api_autenticado.post('/api/desejos/', {'produto_id': produto.id})
        res = api_autenticado.post('/api/desejos/', {'produto_id': produto.id})
        assert res.status_code == 400

    def test_remover_da_wishlist(self, api_autenticado, usuario):
        produto = ProdutoFactory()
        ListaDesejo.objects.create(usuario=usuario, produto=produto)
        res = api_autenticado.delete(f'/api/desejos/{produto.id}/')
        assert res.status_code == 204
        assert not ListaDesejo.objects.filter(usuario=usuario, produto=produto).exists()

    def test_listar_wishlist(self, api_autenticado, usuario):
        produto = ProdutoFactory()
        ListaDesejo.objects.create(usuario=usuario, produto=produto)
        res = api_autenticado.get('/api/desejos/')
        assert res.status_code == 200
        assert res.data['count'] == 1
