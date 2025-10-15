"""Serviços auxiliares relacionados a pagamentos."""

from __future__ import annotations

import re
import uuid
from decimal import Decimal
from typing import Dict, Any


class PagamentoErro(Exception):
    """Erro específico para falhas no processamento de pagamento."""


def processar_pagamento(valor: Decimal, metodo: str, dados: Dict[str, Any]) -> Dict[str, Any]:
    """Processa um pagamento simulando a comunicação com um gateway externo."""

    if valor is None:
        raise PagamentoErro('Valor do pagamento não informado.')

    try:
        valor_decimal = Decimal(valor)
    except Exception as exc:  # pragma: no cover - proteção contra tipos inesperados
        raise PagamentoErro('Valor do pagamento inválido.') from exc

    if valor_decimal <= 0:
        raise PagamentoErro('Valor do pagamento deve ser maior que zero.')

    metodo = (metodo or '').strip().lower()

    if metodo == 'cartao_credito':
        return _processar_cartao_credito(valor_decimal, dados)
    if metodo == 'pix':
        return _processar_pix(valor_decimal)
    if metodo == 'boleto':
        return _processar_boleto(valor_decimal)

    raise PagamentoErro('Método de pagamento não suportado.')


def _processar_cartao_credito(valor: Decimal, dados: Dict[str, Any]) -> Dict[str, Any]:
    numero_bruto = (dados.get('numero_cartao') or '').strip()
    numero_sanitizado = re.sub(r'\D', '', numero_bruto)

    if len(numero_sanitizado) < 13 or len(numero_sanitizado) > 19:
        raise PagamentoErro('Informe um número de cartão válido.')

    nome_portador = (dados.get('nome_portador') or '').strip()
    if len(nome_portador) < 5:
        raise PagamentoErro('Informe o nome completo do titular do cartão.')

    validade = (dados.get('validade') or '').strip()
    if not re.fullmatch(r'(0[1-9]|1[0-2])\/(\d{2})', validade):
        raise PagamentoErro('Informe a validade no formato MM/AA.')

    cvv = (dados.get('cvv') or '').strip()
    if not re.fullmatch(r'\d{3,4}', cvv):
        raise PagamentoErro('Informe um código de segurança válido (3 ou 4 dígitos).')

    transacao_id = uuid.uuid4().hex
    cartao_final = numero_sanitizado[-4:]

    # Regra simples para simular autorização: cartões com final par são aprovados.
    if int(cartao_final[-1]) % 2 != 0:
        return {
            'status': 'recusado',
            'transacao_id': transacao_id,
            'mensagem': 'Pagamento não autorizado pelo emissor do cartão.',
            'cartao_final': cartao_final,
            'nome_portador': nome_portador,
        }

    return {
        'status': 'autorizado',
        'transacao_id': transacao_id,
        'mensagem': 'Pagamento aprovado com cartão de crédito.',
        'cartao_final': cartao_final,
        'nome_portador': nome_portador,
    }


def _processar_pix(valor: Decimal) -> Dict[str, Any]:
    codigo = f'PIX-{uuid.uuid4().hex[:10].upper()}'
    return {
        'status': 'autorizado',
        'transacao_id': uuid.uuid4().hex,
        'mensagem': 'Pagamento Pix confirmado automaticamente.',
        'codigo_confirmacao': codigo,
    }


def _processar_boleto(valor: Decimal) -> Dict[str, Any]:
    # Linha digitável fictícia formatada para exibição.
    bloco = uuid.uuid4().hex.upper()
    linha_digitavel = ' '.join([bloco[i:i + 5] for i in range(0, 25, 5)])

    return {
        'status': 'pendente',
        'transacao_id': uuid.uuid4().hex,
        'mensagem': 'Boleto gerado. Aguarde a compensação para confirmação do pagamento.',
        'codigo_confirmacao': linha_digitavel,
    }
