from django.db import models
from django.contrib.auth.models import User
from produtos.models import Produto


class Pedido(models.Model):
    """Modelo para pedidos de compra."""
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('processando', 'Processando'),
        ('enviado', 'Enviado'),
        ('entregue', 'Entregue'),
        ('cancelado', 'Cancelado'),
    ]

    usuario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='pedidos'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pendente'
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    valor_frete = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text='Valor cobrado de frete para este pedido'
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    # Informações de entrega
    endereco = models.CharField(max_length=255)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    cep = models.CharField(max_length=9)
    telefone = models.CharField(max_length=15)

    class Meta:
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-criado_em']

    def __str__(self):
        return f'Pedido #{self.id} - {self.usuario.username}'

    @property
    def total_com_frete(self):
        """Retorna o total geral incluindo o frete."""
        return self.total + self.valor_frete


class ItemPedido(models.Model):
    """Modelo para itens de um pedido."""
    pedido = models.ForeignKey(
        Pedido, 
        on_delete=models.CASCADE, 
        related_name='itens'
    )
    produto = models.ForeignKey(
        Produto, 
        on_delete=models.CASCADE
    )
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        verbose_name = 'Item do Pedido'
        verbose_name_plural = 'Itens dos Pedidos'

    def __str__(self):
        return f'{self.quantidade}x {self.produto.nome}'

    @property
    def subtotal(self):
        """Calcula o subtotal do item."""
        return self.quantidade * self.preco_unitario


class Pagamento(models.Model):
    """Registra as informações de pagamento de um pedido."""

    METODO_CHOICES = [
        ('cartao_credito', 'Cartão de Crédito'),
        ('pix', 'Pix'),
        ('boleto', 'Boleto Bancário'),
    ]

    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('autorizado', 'Autorizado'),
        ('recusado', 'Recusado'),
    ]

    pedido = models.OneToOneField(
        Pedido,
        on_delete=models.CASCADE,
        related_name='pagamento'
    )
    metodo = models.CharField(max_length=20, choices=METODO_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    transacao_id = models.CharField(max_length=64, blank=True)
    codigo_confirmacao = models.CharField(
        max_length=128,
        blank=True,
        help_text='Código retornado pelo provedor de pagamento'
    )
    mensagem_retorno = models.TextField(blank=True)
    cartao_final = models.CharField(max_length=4, blank=True)
    nome_portador = models.CharField(max_length=150, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pagamento'
        verbose_name_plural = 'Pagamentos'
        ordering = ['-criado_em']

    def __str__(self):
        return f'Pagamento #{self.id} - Pedido #{self.pedido_id}'
