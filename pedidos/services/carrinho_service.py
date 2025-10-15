"""Serviço para gerenciar carrinho de compras persistente."""
from django.db.models import Sum, F
from django.core.exceptions import ValidationError
from produtos.models import Produto
from pedidos.models import CarrinhoItem


class CarrinhoService:
    """Service layer para operações do carrinho de compras."""

    @staticmethod
    def _get_session_key(request):
        """Obtém ou cria uma chave de sessão."""
        if not request.session.session_key:
            request.session.create()
        return request.session.session_key

    @staticmethod
    def get_carrinho(request):
        """
        Retorna o queryset de itens do carrinho.
        
        Args:
            request: HttpRequest object
            
        Returns:
            QuerySet[CarrinhoItem]: Itens do carrinho do usuário ou sessão
        """
        if request.user.is_authenticated:
            return CarrinhoItem.objects.filter(
                usuario=request.user
            ).select_related('produto', 'produto__categoria')
        else:
            session_key = CarrinhoService._get_session_key(request)
            return CarrinhoItem.objects.filter(
                session_key=session_key
            ).select_related('produto', 'produto__categoria')

    @staticmethod
    def adicionar_produto(request, produto_id, quantidade=1):
        """
        Adiciona um produto ao carrinho ou atualiza quantidade se já existir.
        
        Args:
            request: HttpRequest object
            produto_id: ID do produto
            quantidade: Quantidade a adicionar (default: 1)
            
        Returns:
            CarrinhoItem: Item do carrinho criado/atualizado
            
        Raises:
            ValidationError: Se produto não existir ou estoque insuficiente
        """
        try:
            produto = Produto.objects.get(id=produto_id, ativo=True)
        except Produto.DoesNotExist:
            raise ValidationError('Produto não encontrado ou inativo.')

        if quantidade <= 0:
            raise ValidationError('Quantidade deve ser maior que zero.')

        if quantidade > produto.estoque:
            raise ValidationError(f'Estoque insuficiente. Disponível: {produto.estoque}')

        if request.user.is_authenticated:
            item, created = CarrinhoItem.objects.get_or_create(
                usuario=request.user,
                produto=produto,
                defaults={'quantidade': quantidade}
            )
        else:
            session_key = CarrinhoService._get_session_key(request)
            item, created = CarrinhoItem.objects.get_or_create(
                session_key=session_key,
                produto=produto,
                defaults={'quantidade': quantidade}
            )

        if not created:
            # Item já existe, incrementa quantidade
            nova_quantidade = item.quantidade + quantidade
            if nova_quantidade > produto.estoque:
                raise ValidationError(f'Estoque insuficiente. Disponível: {produto.estoque}')
            item.quantidade = nova_quantidade
            item.save()

        return item

    @staticmethod
    def atualizar_quantidade(request, produto_id, quantidade):
        """
        Atualiza a quantidade de um produto no carrinho.
        
        Args:
            request: HttpRequest object
            produto_id: ID do produto
            quantidade: Nova quantidade
            
        Returns:
            CarrinhoItem: Item atualizado
            
        Raises:
            ValidationError: Se item não existir, quantidade inválida ou estoque insuficiente
        """
        if quantidade <= 0:
            raise ValidationError('Quantidade deve ser maior que zero.')

        try:
            if request.user.is_authenticated:
                item = CarrinhoItem.objects.get(
                    usuario=request.user,
                    produto_id=produto_id
                )
            else:
                session_key = CarrinhoService._get_session_key(request)
                item = CarrinhoItem.objects.get(
                    session_key=session_key,
                    produto_id=produto_id
                )
        except CarrinhoItem.DoesNotExist:
            raise ValidationError('Item não encontrado no carrinho.')

        if quantidade > item.produto.estoque:
            raise ValidationError(f'Estoque insuficiente. Disponível: {item.produto.estoque}')

        item.quantidade = quantidade
        item.save()
        return item

    @staticmethod
    def remover_produto(request, produto_id):
        """
        Remove um produto do carrinho.
        
        Args:
            request: HttpRequest object
            produto_id: ID do produto
            
        Returns:
            bool: True se removido com sucesso
            
        Raises:
            ValidationError: Se item não existir
        """
        try:
            if request.user.is_authenticated:
                item = CarrinhoItem.objects.get(
                    usuario=request.user,
                    produto_id=produto_id
                )
            else:
                session_key = CarrinhoService._get_session_key(request)
                item = CarrinhoItem.objects.get(
                    session_key=session_key,
                    produto_id=produto_id
                )
            item.delete()
            return True
        except CarrinhoItem.DoesNotExist:
            raise ValidationError('Item não encontrado no carrinho.')

    @staticmethod
    def limpar_carrinho(request):
        """
        Remove todos os itens do carrinho.
        
        Args:
            request: HttpRequest object
            
        Returns:
            int: Número de itens removidos
        """
        if request.user.is_authenticated:
            count, _ = CarrinhoItem.objects.filter(usuario=request.user).delete()
        else:
            session_key = CarrinhoService._get_session_key(request)
            count, _ = CarrinhoItem.objects.filter(session_key=session_key).delete()
        return count

    @staticmethod
    def get_total(request):
        """
        Calcula o total do carrinho.
        
        Args:
            request: HttpRequest object
            
        Returns:
            Decimal: Total do carrinho
        """
        carrinho = CarrinhoService.get_carrinho(request)
        total = carrinho.aggregate(
            total=Sum(F('quantidade') * F('produto__preco'))
        )['total']
        return total or 0

    @staticmethod
    def get_quantidade_total(request):
        """
        Retorna a quantidade total de itens no carrinho.
        
        Args:
            request: HttpRequest object
            
        Returns:
            int: Quantidade total de itens
        """
        carrinho = CarrinhoService.get_carrinho(request)
        total = carrinho.aggregate(total=Sum('quantidade'))['total']
        return total or 0

    @staticmethod
    def migrar_carrinho_anonimo_para_usuario(session_key, usuario):
        """
        Migra itens do carrinho anônimo para usuário autenticado.
        
        Args:
            session_key: Chave da sessão anônima
            usuario: Objeto User
            
        Returns:
            int: Número de itens migrados
        """
        if not session_key:
            return 0

        itens_anonimos = CarrinhoItem.objects.filter(session_key=session_key)
        count = 0

        for item_anonimo in itens_anonimos:
            try:
                # Verifica se usuário já tem esse produto no carrinho
                item_usuario = CarrinhoItem.objects.get(
                    usuario=usuario,
                    produto=item_anonimo.produto
                )
                # Soma as quantidades (respeitando estoque)
                nova_quantidade = min(
                    item_usuario.quantidade + item_anonimo.quantidade,
                    item_anonimo.produto.estoque
                )
                item_usuario.quantidade = nova_quantidade
                item_usuario.save()
                item_anonimo.delete()
                count += 1
            except CarrinhoItem.DoesNotExist:
                # Usuário não tem esse produto, transfere o item
                item_anonimo.usuario = usuario
                item_anonimo.session_key = None
                item_anonimo.save()
                count += 1

        return count
