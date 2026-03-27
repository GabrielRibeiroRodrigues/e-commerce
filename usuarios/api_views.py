from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from usuarios.models import ListaDesejo
from .serializers import RegistroSerializer, PerfilSerializer, ListaDesejoSerializer


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'Conta criada com sucesso.'},
            status=status.HTTP_201_CREATED,
        )


class PerfilView(generics.RetrieveUpdateAPIView):
    serializer_class = PerfilSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ListaDesejoListView(generics.ListCreateAPIView):
    serializer_class = ListaDesejoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ListaDesejo.objects.filter(
            usuario=self.request.user
        ).select_related('produto', 'produto__categoria')


class ListaDesejoDetalheView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ListaDesejo.objects.filter(usuario=self.request.user)

    def destroy(self, request, *args, **kwargs):
        produto_id = kwargs.get('produto_id')
        try:
            item = ListaDesejo.objects.get(usuario=request.user, produto_id=produto_id)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ListaDesejo.DoesNotExist:
            return Response({'detail': 'Item não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
