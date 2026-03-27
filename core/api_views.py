from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from produtos.models import Produto
from produtos.serializers import ProdutoListSerializer


class HomeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        destaques = Produto.objects.filter(
            ativo=True, destaque=True
        ).select_related('categoria')[:8]

        promocoes = Produto.objects.filter(
            ativo=True, preco_promocional__isnull=False
        ).select_related('categoria')[:8]

        return Response({
            'destaques': ProdutoListSerializer(destaques, many=True, context={'request': request}).data,
            'promocoes': ProdutoListSerializer(promocoes, many=True, context={'request': request}).data,
        })
