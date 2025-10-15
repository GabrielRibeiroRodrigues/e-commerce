from django.contrib.auth.models import User
from django.db import models
from produtos.models import Produto


class ListaDesejo(models.Model):
	"""Itens que usuários adicionam à lista de desejos."""
	usuario = models.ForeignKey(
		User,
		on_delete=models.CASCADE,
		related_name='lista_desejos'
	)
	produto = models.ForeignKey(
		Produto,
		on_delete=models.CASCADE,
		related_name='favoritos'
	)
	criado_em = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = 'Item da Lista de Desejos'
		verbose_name_plural = 'Lista de Desejos'
		unique_together = ('usuario', 'produto')
		ordering = ['-criado_em']

	def __str__(self):
		return f'{self.usuario.username} → {self.produto.nome}'


class ContaSocial(models.Model):
	"""Armazena vínculos de contas sociais dos usuários."""

	PROVEDOR_GOOGLE = 'google'
	PROVEDOR_CHOICES = [
		(PROVEDOR_GOOGLE, 'Google'),
	]

	usuario = models.ForeignKey(
		User,
		on_delete=models.CASCADE,
		related_name='contas_sociais'
	)
	provedor = models.CharField(max_length=20, choices=PROVEDOR_CHOICES)
	external_id = models.CharField(max_length=200)
	email = models.EmailField()
	criado_em = models.DateTimeField(auto_now_add=True)
	atualizado_em = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Conta Social'
		verbose_name_plural = 'Contas Sociais'
		unique_together = (
			('provedor', 'external_id'),
		)
		ordering = ['-criado_em']

	def __str__(self):
		return f'{self.get_provedor_display()} → {self.usuario.username}'
