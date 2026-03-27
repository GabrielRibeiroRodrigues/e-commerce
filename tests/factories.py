import factory
from django.contrib.auth.models import User
from produtos.models import Categoria, Produto, Avaliacao
from pedidos.models import CarrinhoItem, Pedido, ItemPedido, Pagamento


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda o: f'{o.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'senha123')
    first_name = factory.Faker('first_name', locale='pt_BR')
    last_name = factory.Faker('last_name', locale='pt_BR')


class CategoriaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Categoria

    nome = factory.Sequence(lambda n: f'Categoria {n}')
    descricao = factory.Faker('sentence', locale='pt_BR')


class ProdutoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Produto

    nome = factory.Sequence(lambda n: f'Produto {n}')
    descricao = factory.Faker('paragraph', locale='pt_BR')
    preco = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    preco_promocional = None
    categoria = factory.SubFactory(CategoriaFactory)
    estoque = 10
    ativo = True
    destaque = False


class AvaliacaoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Avaliacao

    produto = factory.SubFactory(ProdutoFactory)
    usuario = factory.SubFactory(UserFactory)
    rating = 4
    comentario = factory.Faker('sentence', locale='pt_BR')


class PedidoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pedido

    usuario = factory.SubFactory(UserFactory)
    status = 'pendente'
    total = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    valor_frete = '14.90'
    endereco = 'Rua Teste, 123'
    cidade = 'São Paulo'
    estado = 'SP'
    cep = '01310100'
    telefone = '11999999999'


class ItemPedidoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ItemPedido

    pedido = factory.SubFactory(PedidoFactory)
    produto = factory.SubFactory(ProdutoFactory)
    quantidade = 1
    preco_unitario = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)


class PagamentoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pagamento

    pedido = factory.SubFactory(PedidoFactory)
    metodo = 'pix'
    status = 'autorizado'
    valor = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    transacao_id = factory.Faker('uuid4')
    codigo_confirmacao = 'PIX-TESTE123'
