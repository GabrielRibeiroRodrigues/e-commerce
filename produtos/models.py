from django.db import models
from django.utils.text import slugify
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill, ResizeToFit


class Categoria(models.Model):
    """Modelo para categorias de produtos."""
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['nome']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nome)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome


class Produto(models.Model):
    """Modelo para produtos da farmácia."""
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    preco_promocional = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text='Preço promocional (opcional)'
    )
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.CASCADE, 
        related_name='produtos'
    )
    imagem = models.ImageField(
        upload_to='produtos/', 
        null=True, 
        blank=True
    )
    
    # Thumbnails otimizados gerados automaticamente
    thumbnail = ImageSpecField(
        source='imagem',
        processors=[ResizeToFill(300, 300)],
        format='JPEG',
        options={'quality': 85}
    )
    
    thumbnail_lista = ImageSpecField(
        source='imagem',
        processors=[ResizeToFill(260, 220)],
        format='JPEG',
        options={'quality': 80}
    )
    
    imagem_detalhe = ImageSpecField(
        source='imagem',
        processors=[ResizeToFit(800, 800)],
        format='JPEG',
        options={'quality': 90}
    )
    
    estoque = models.PositiveIntegerField(default=0)
    ativo = models.BooleanField(default=True)
    destaque = models.BooleanField(
        default=False, 
        help_text='Produto em destaque na página inicial'
    )
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['-criado_em']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nome)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome

    @property
    def preco_final(self):
        """Retorna o preço promocional se existir, senão o preço normal."""
        return self.preco_promocional if self.preco_promocional else self.preco

    @property
    def tem_promocao(self):
        """Verifica se o produto tem preço promocional."""
        return self.preco_promocional is not None and self.preco_promocional < self.preco

    @property
    def disponivel(self):
        """Verifica se o produto está disponível para venda."""
        return self.ativo and self.estoque > 0
