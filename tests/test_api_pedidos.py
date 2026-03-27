"""Testes de integração — carrinho, frete, checkout e pedidos."""
import pytest
from decimal import Decimal
from tests.factories import ProdutoFactory, PedidoFactory, ItemPedidoFactory, PagamentoFactory


@pytest.mark.django_db
class TestCarrinhoAPI:
    def test_carrinho_requer_autenticacao(self, api_client):
        res = api_client.get('/api/carrinho/')
        assert res.status_code == 401

    def test_carrinho_vazio(self, api_autenticado):
        res = api_autenticado.get('/api/carrinho/')
        assert res.status_code == 200
        assert res.data['itens'] == []
        assert float(res.data['total']) == 0

    def test_adicionar_item(self, api_autenticado):
        produto = ProdutoFactory(estoque=10)
        res = api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 2})
        assert res.status_code == 201
        assert res.data['quantidade'] == 2

    def test_adicionar_item_estoque_insuficiente(self, api_autenticado):
        produto = ProdutoFactory(estoque=1)
        res = api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 5})
        assert res.status_code == 400

    def test_atualizar_item(self, api_autenticado):
        produto = ProdutoFactory(estoque=10)
        api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 1})
        res = api_autenticado.put(f'/api/carrinho/{produto.id}/', {'quantidade': 3})
        assert res.status_code == 200
        assert res.data['quantidade'] == 3

    def test_remover_item(self, api_autenticado):
        produto = ProdutoFactory(estoque=10)
        api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 1})
        res = api_autenticado.delete(f'/api/carrinho/{produto.id}/')
        assert res.status_code == 204

    def test_total_calculado_corretamente(self, api_autenticado):
        produto = ProdutoFactory(estoque=10, preco=Decimal('20.00'))
        api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 3})
        res = api_autenticado.get('/api/carrinho/')
        assert float(res.data['total']) == 60.0


@pytest.mark.django_db
class TestFreteAPI:
    def test_calcular_frete_sudeste(self, api_client):
        res = api_client.post('/api/frete/calcular/', {'cep': '01310100'})
        assert res.status_code == 200
        assert float(res.data['valor_frete']) == 14.90

    def test_calcular_frete_norte(self, api_client):
        res = api_client.post('/api/frete/calcular/', {'cep': '69000000'})
        assert res.status_code == 200
        assert float(res.data['valor_frete']) == 29.90

    def test_cep_invalido_retorna_400(self, api_client):
        res = api_client.post('/api/frete/calcular/', {'cep': '123'})
        assert res.status_code == 400


@pytest.mark.django_db
class TestCheckoutAPI:
    BASE_PAYLOAD = {
        'endereco': 'Rua Teste, 100',
        'cidade': 'São Paulo',
        'estado': 'SP',
        'cep': '01310100',
        'telefone': '11999999999',
        'metodo_pagamento': 'pix',
    }

    def test_checkout_requer_autenticacao(self, api_client):
        res = api_client.post('/api/checkout/', self.BASE_PAYLOAD)
        assert res.status_code == 401

    def test_checkout_carrinho_vazio_retorna_400(self, api_autenticado):
        res = api_autenticado.post('/api/checkout/', self.BASE_PAYLOAD)
        assert res.status_code == 400
        assert 'vazio' in res.data['detail'].lower()

    def test_checkout_pix_aprovado(self, api_autenticado):
        produto = ProdutoFactory(estoque=10, preco=Decimal('50.00'))
        api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 1})
        res = api_autenticado.post('/api/checkout/', self.BASE_PAYLOAD)
        assert res.status_code == 201
        assert res.data['pagamento']['status'] == 'autorizado'
        assert res.data['pagamento']['metodo'] == 'pix'

    def test_checkout_limpa_carrinho(self, api_autenticado):
        produto = ProdutoFactory(estoque=10, preco=Decimal('50.00'))
        api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 1})
        api_autenticado.post('/api/checkout/', self.BASE_PAYLOAD)
        carrinho = api_autenticado.get('/api/carrinho/')
        assert carrinho.data['itens'] == []

    def test_checkout_decrementa_estoque(self, api_autenticado):
        produto = ProdutoFactory(estoque=10, preco=Decimal('50.00'))
        api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 3})
        api_autenticado.post('/api/checkout/', self.BASE_PAYLOAD)
        produto.refresh_from_db()
        assert produto.estoque == 7

    def test_checkout_cartao_recusado_cria_pedido_com_status_recusado(self, api_autenticado):
        produto = ProdutoFactory(estoque=10, preco=Decimal('50.00'))
        api_autenticado.post('/api/carrinho/', {'produto_id': produto.id, 'quantidade': 1})
        payload = {
            **self.BASE_PAYLOAD,
            'metodo_pagamento': 'cartao_credito',
            'numero_cartao': '4111111111111111',  # final ímpar = recusado
            'nome_portador': 'JOAO DA SILVA',
            'validade': '12/26',
            'cvv': '123',
        }
        res = api_autenticado.post('/api/checkout/', payload)
        assert res.status_code == 201
        assert res.data['pagamento']['status'] == 'recusado'


@pytest.mark.django_db
class TestPedidosAPI:
    def test_pedidos_requer_autenticacao(self, api_client):
        res = api_client.get('/api/pedidos/')
        assert res.status_code == 401

    def test_lista_pedidos_do_usuario(self, api_autenticado, usuario):
        PedidoFactory(usuario=usuario)
        PedidoFactory(usuario=usuario)
        res = api_autenticado.get('/api/pedidos/')
        assert res.status_code == 200
        assert res.data['count'] == 2

    def test_pedido_de_outro_usuario_nao_aparece(self, api_autenticado):
        PedidoFactory()  # outro usuário
        res = api_autenticado.get('/api/pedidos/')
        assert res.data['count'] == 0

    def test_detalhe_pedido(self, api_autenticado, usuario):
        pedido = PedidoFactory(usuario=usuario)
        ItemPedidoFactory(pedido=pedido)
        PagamentoFactory(pedido=pedido)
        res = api_autenticado.get(f'/api/pedidos/{pedido.id}/')
        assert res.status_code == 200
        assert res.data['id'] == pedido.id
        assert 'itens' in res.data
        assert 'pagamento' in res.data

    def test_detalhe_pedido_outro_usuario_retorna_404(self, api_autenticado):
        pedido = PedidoFactory()  # outro usuário
        res = api_autenticado.get(f'/api/pedidos/{pedido.id}/')
        assert res.status_code == 404
