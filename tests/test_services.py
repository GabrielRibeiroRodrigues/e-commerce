"""Testes unitários dos services."""
import pytest
from decimal import Decimal
from unittest.mock import MagicMock
from django.core.exceptions import ValidationError

from pedidos.services.carrinho_service import CarrinhoService
from pedidos.services import processar_pagamento, PagamentoErro
from pedidos.models import CarrinhoItem
from tests.factories import UserFactory, ProdutoFactory


# ─── Helpers ────────────────────────────────────────────────────────────────

def _make_request(user=None, session_key='sess-abc'):
    from django.contrib.auth.models import AnonymousUser
    req = MagicMock()
    req.user = user if user is not None else AnonymousUser()
    req.session.session_key = session_key
    req.session.create = MagicMock()
    return req


# ─── CarrinhoService ────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestCarrinhoService:
    def test_adicionar_produto_usuario_autenticado(self):
        usuario = UserFactory()
        produto = ProdutoFactory(estoque=5)
        req = _make_request(user=usuario)

        item = CarrinhoService.adicionar_produto(req, produto.id, 2)

        assert item.quantidade == 2
        assert item.usuario == usuario

    def test_adicionar_produto_anonimo(self):
        produto = ProdutoFactory(estoque=5)
        req = _make_request()

        item = CarrinhoService.adicionar_produto(req, produto.id, 1)

        assert item.quantidade == 1
        assert item.session_key == 'sess-abc'

    def test_adicionar_produto_inexistente_levanta_erro(self):
        req = _make_request()
        with pytest.raises(ValidationError, match='não encontrado'):
            CarrinhoService.adicionar_produto(req, 99999, 1)

    def test_adicionar_produto_estoque_insuficiente(self):
        produto = ProdutoFactory(estoque=2)
        req = _make_request()
        with pytest.raises(ValidationError, match='Estoque insuficiente'):
            CarrinhoService.adicionar_produto(req, produto.id, 5)

    def test_adicionar_produto_incrementa_se_ja_existe(self):
        usuario = UserFactory()
        produto = ProdutoFactory(estoque=10)
        req = _make_request(user=usuario)
        CarrinhoService.adicionar_produto(req, produto.id, 2)
        CarrinhoService.adicionar_produto(req, produto.id, 3)

        item = CarrinhoItem.objects.get(usuario=usuario, produto=produto)
        assert item.quantidade == 5

    def test_remover_produto(self):
        usuario = UserFactory()
        produto = ProdutoFactory(estoque=5)
        req = _make_request(user=usuario)

        CarrinhoService.adicionar_produto(req, produto.id, 1)
        CarrinhoService.remover_produto(req, produto.id)

        assert not CarrinhoItem.objects.filter(usuario=usuario, produto=produto).exists()

    def test_remover_produto_inexistente_levanta_erro(self):
        usuario = UserFactory()
        req = _make_request(user=usuario)

        with pytest.raises(ValidationError, match='não encontrado'):
            CarrinhoService.remover_produto(req, 99999)

    def test_atualizar_quantidade(self):
        usuario = UserFactory()
        produto = ProdutoFactory(estoque=10)
        req = _make_request(user=usuario)

        CarrinhoService.adicionar_produto(req, produto.id, 1)
        item = CarrinhoService.atualizar_quantidade(req, produto.id, 4)

        assert item.quantidade == 4

    def test_atualizar_quantidade_zero_levanta_erro(self):
        usuario = UserFactory()
        req = _make_request(user=usuario)

        with pytest.raises(ValidationError, match='maior que zero'):
            CarrinhoService.atualizar_quantidade(req, 1, 0)

    def test_get_total(self):
        usuario = UserFactory()
        produto = ProdutoFactory(estoque=10, preco=Decimal('20.00'))
        req = _make_request(user=usuario)

        CarrinhoService.adicionar_produto(req, produto.id, 3)
        total = CarrinhoService.get_total(req)

        assert total == Decimal('60.00')

    def test_limpar_carrinho(self):
        usuario = UserFactory()
        produto1 = ProdutoFactory(estoque=5)
        produto2 = ProdutoFactory(estoque=5)
        req = _make_request(user=usuario)

        CarrinhoService.adicionar_produto(req, produto1.id, 1)
        CarrinhoService.adicionar_produto(req, produto2.id, 1)
        count = CarrinhoService.limpar_carrinho(req)

        assert count == 2
        assert CarrinhoItem.objects.filter(usuario=usuario).count() == 0

    def test_migrar_carrinho_anonimo_para_usuario(self):
        usuario = UserFactory()
        produto = ProdutoFactory(estoque=10)
        CarrinhoItem.objects.create(session_key='sess-teste', produto=produto, quantidade=2)

        count = CarrinhoService.migrar_carrinho_anonimo_para_usuario('sess-teste', usuario)

        assert count == 1
        item = CarrinhoItem.objects.get(usuario=usuario, produto=produto)
        assert item.quantidade == 2


# ─── PagamentoService ────────────────────────────────────────────────────────

class TestPagamentoService:
    def test_pix_aprovado(self):
        resultado = processar_pagamento(Decimal('100.00'), 'pix', {})
        assert resultado['status'] == 'autorizado'
        assert 'transacao_id' in resultado

    def test_boleto_pendente(self):
        resultado = processar_pagamento(Decimal('50.00'), 'boleto', {})
        assert resultado['status'] == 'pendente'
        assert 'codigo_confirmacao' in resultado

    def test_cartao_aprovado_final_par(self):
        dados = {'numero_cartao': '4111111111111112', 'nome_portador': 'JOAO DA SILVA',
                 'validade': '12/26', 'cvv': '123'}
        resultado = processar_pagamento(Decimal('200.00'), 'cartao_credito', dados)
        assert resultado['status'] == 'autorizado'
        assert resultado['cartao_final'] == '1112'

    def test_cartao_recusado_final_impar(self):
        dados = {'numero_cartao': '4111111111111111', 'nome_portador': 'JOAO DA SILVA',
                 'validade': '12/26', 'cvv': '123'}
        resultado = processar_pagamento(Decimal('200.00'), 'cartao_credito', dados)
        assert resultado['status'] == 'recusado'

    def test_cartao_numero_invalido(self):
        dados = {'numero_cartao': '123', 'nome_portador': 'JOAO', 'validade': '12/26', 'cvv': '123'}
        with pytest.raises(PagamentoErro, match='número de cartão válido'):
            processar_pagamento(Decimal('100.00'), 'cartao_credito', dados)

    def test_cartao_validade_invalida(self):
        dados = {'numero_cartao': '4111111111111112', 'nome_portador': 'JOAO DA SILVA',
                 'validade': '13/26', 'cvv': '123'}
        with pytest.raises(PagamentoErro, match='validade'):
            processar_pagamento(Decimal('100.00'), 'cartao_credito', dados)

    def test_valor_zero_levanta_erro(self):
        with pytest.raises(PagamentoErro, match='maior que zero'):
            processar_pagamento(Decimal('0'), 'pix', {})

    def test_metodo_invalido_levanta_erro(self):
        with pytest.raises(PagamentoErro, match='não suportado'):
            processar_pagamento(Decimal('100.00'), 'bitcoin', {})
