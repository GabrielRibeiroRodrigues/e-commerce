from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ConsentimentoLGPD(models.Model):
    """Modelo para armazenar consentimentos LGPD dos usuários."""
    
    TIPO_CONSENTIMENTO_CHOICES = [
        ('termos_uso', 'Termos de Uso'),
        ('politica_privacidade', 'Política de Privacidade'),
        ('marketing', 'Comunicações de Marketing'),
        ('cookies', 'Uso de Cookies'),
        ('dados_pessoais', 'Tratamento de Dados Pessoais'),
    ]
    
    usuario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='consentimentos',
        verbose_name='Usuário'
    )
    tipo = models.CharField(
        'Tipo de Consentimento',
        max_length=50,
        choices=TIPO_CONSENTIMENTO_CHOICES
    )
    consentido = models.BooleanField('Consentido', default=False)
    ip_address = models.GenericIPAddressField('Endereço IP', null=True, blank=True)
    user_agent = models.TextField('User Agent', blank=True)
    data_consentimento = models.DateTimeField('Data do Consentimento', auto_now_add=True)
    data_revogacao = models.DateTimeField('Data de Revogação', null=True, blank=True)
    versao_termos = models.CharField('Versão dos Termos', max_length=20, default='1.0')
    
    class Meta:
        verbose_name = 'Consentimento LGPD'
        verbose_name_plural = 'Consentimentos LGPD'
        ordering = ['-data_consentimento']
        indexes = [
            models.Index(fields=['usuario', 'tipo']),
            models.Index(fields=['data_consentimento']),
        ]
    
    def __str__(self):
        status = "Consentido" if self.consentido else "Revogado"
        return f"{self.usuario.username} - {self.get_tipo_display()} ({status})"


class SolicitacaoDados(models.Model):
    """Modelo para gerenciar solicitações de dados do titular (Art. 18 LGPD)."""
    
    TIPO_SOLICITACAO_CHOICES = [
        ('acesso', 'Acesso aos Dados'),
        ('correcao', 'Correção de Dados'),
        ('anonimizacao', 'Anonimização'),
        ('exclusao', 'Exclusão de Dados'),
        ('portabilidade', 'Portabilidade'),
        ('informacao', 'Informações sobre Tratamento'),
        ('revogacao', 'Revogação de Consentimento'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('em_analise', 'Em Análise'),
        ('processando', 'Processando'),
        ('concluida', 'Concluída'),
        ('rejeitada', 'Rejeitada'),
    ]
    
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='solicitacoes_dados',
        verbose_name='Usuário'
    )
    tipo = models.CharField(
        'Tipo de Solicitação',
        max_length=20,
        choices=TIPO_SOLICITACAO_CHOICES
    )
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente'
    )
    descricao = models.TextField('Descrição', blank=True)
    resposta = models.TextField('Resposta', blank=True)
    arquivo_resposta = models.FileField(
        'Arquivo de Resposta',
        upload_to='lgpd/solicitacoes/%Y/%m/',
        null=True,
        blank=True
    )
    ip_solicitacao = models.GenericIPAddressField('IP da Solicitação', null=True, blank=True)
    data_solicitacao = models.DateTimeField('Data da Solicitação', auto_now_add=True)
    data_processamento = models.DateTimeField('Data de Processamento', null=True, blank=True)
    data_conclusao = models.DateTimeField('Data de Conclusão', null=True, blank=True)
    processado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='solicitacoes_processadas',
        verbose_name='Processado por'
    )
    
    class Meta:
        verbose_name = 'Solicitação de Dados'
        verbose_name_plural = 'Solicitações de Dados'
        ordering = ['-data_solicitacao']
        indexes = [
            models.Index(fields=['usuario', 'status']),
            models.Index(fields=['data_solicitacao']),
        ]
    
    def __str__(self):
        return f"{self.usuario.username} - {self.get_tipo_display()} ({self.get_status_display()})"


class LogAcessoDados(models.Model):
    """Modelo para auditoria de acessos a dados pessoais."""
    
    TIPO_ACAO_CHOICES = [
        ('leitura', 'Leitura'),
        ('criacao', 'Criação'),
        ('atualizacao', 'Atualização'),
        ('exclusao', 'Exclusão'),
        ('exportacao', 'Exportação'),
    ]
    
    usuario_titular = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='logs_acesso_titular',
        verbose_name='Titular dos Dados'
    )
    usuario_operador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='logs_acesso_operador',
        verbose_name='Operador'
    )
    acao = models.CharField('Ação', max_length=20, choices=TIPO_ACAO_CHOICES)
    modelo = models.CharField('Modelo', max_length=100)
    campo = models.CharField('Campo', max_length=100, blank=True)
    valor_anterior = models.TextField('Valor Anterior', blank=True)
    valor_novo = models.TextField('Valor Novo', blank=True)
    ip_address = models.GenericIPAddressField('Endereço IP', null=True, blank=True)
    justificativa = models.TextField('Justificativa', blank=True)
    data_acesso = models.DateTimeField('Data do Acesso', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Log de Acesso a Dados'
        verbose_name_plural = 'Logs de Acesso a Dados'
        ordering = ['-data_acesso']
        indexes = [
            models.Index(fields=['usuario_titular', 'data_acesso']),
            models.Index(fields=['usuario_operador', 'data_acesso']),
            models.Index(fields=['modelo', 'acao']),
        ]
    
    def __str__(self):
        return f"{self.get_acao_display()} - {self.modelo} - {self.data_acesso.strftime('%d/%m/%Y %H:%M')}"


class PoliticaPrivacidade(models.Model):
    """Modelo para versionamento de políticas de privacidade."""
    
    versao = models.CharField('Versão', max_length=20, unique=True)
    titulo = models.CharField('Título', max_length=200)
    conteudo = models.TextField('Conteúdo')
    data_publicacao = models.DateTimeField('Data de Publicação', auto_now_add=True)
    data_vigencia = models.DateTimeField('Data de Vigência')
    ativa = models.BooleanField('Ativa', default=False)
    criado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Criado por'
    )
    
    class Meta:
        verbose_name = 'Política de Privacidade'
        verbose_name_plural = 'Políticas de Privacidade'
        ordering = ['-data_vigencia']
    
    def __str__(self):
        return f"Política v{self.versao} - {self.titulo}"
    
    def save(self, *args, **kwargs):
        if self.ativa:
            # Desativa outras políticas ao ativar esta
            PoliticaPrivacidade.objects.filter(ativa=True).update(ativa=False)
        super().save(*args, **kwargs)
