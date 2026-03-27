from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Categoria, Produto, Avaliacao
from .serializers import (
    CategoriaSerializer,
    ProdutoListSerializer,
    ProdutoDetailSerializer,
    AvaliacaoCreateSerializer,
    AvaliacaoSerializer,
)


class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]


class ProdutoListView(generics.ListAPIView):
    serializer_class = ProdutoListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Produto.objects.filter(ativo=True).select_related('categoria')

        busca = self.request.query_params.get('q')
        if busca:
            qs = qs.filter(Q(nome__icontains=busca) | Q(descricao__icontains=busca))

        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria__slug=categoria)

        destaque = self.request.query_params.get('destaque')
        if destaque == 'true':
            qs = qs.filter(destaque=True)

        promocao = self.request.query_params.get('promocao')
        if promocao == 'true':
            qs = qs.filter(preco_promocional__isnull=False)

        ordenar = self.request.query_params.get('ordenar', '-criado_em')
        campos_validos = ['preco', '-preco', 'nome', '-nome', '-criado_em', 'criado_em']
        if ordenar in campos_validos:
            qs = qs.order_by(ordenar)

        return qs


class ProdutoDetailView(generics.RetrieveAPIView):
    serializer_class = ProdutoDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Produto.objects.filter(ativo=True).select_related('categoria').prefetch_related('avaliacoes__usuario')


class AvaliacaoCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, produto_id):
        try:
            produto = Produto.objects.get(id=produto_id, ativo=True)
        except Produto.DoesNotExist:
            return Response({'detail': 'Produto não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if Avaliacao.objects.filter(produto=produto, usuario=request.user).exists():
            return Response(
                {'detail': 'Você já avaliou este produto.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AvaliacaoCreateSerializer(data=request.data)
        if serializer.is_valid():
            avaliacao = serializer.save(produto=produto, usuario=request.user)
            return Response(AvaliacaoSerializer(avaliacao).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
