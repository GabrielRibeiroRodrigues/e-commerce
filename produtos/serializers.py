from rest_framework import serializers
from .models import Categoria, Produto, Avaliacao


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug', 'descricao']


class AvaliacaoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Avaliacao
        fields = ['id', 'usuario_nome', 'usuario_username', 'rating', 'comentario', 'criado_em']
        read_only_fields = ['id', 'usuario_nome', 'usuario_username', 'criado_em']


class AvaliacaoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avaliacao
        fields = ['rating', 'comentario']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('A avaliação deve ser entre 1 e 5.')
        return value


class ProdutoListSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    preco_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    tem_promocao = serializers.BooleanField(read_only=True)
    disponivel = serializers.BooleanField(read_only=True)
    media_avaliacoes = serializers.FloatField(read_only=True)
    total_avaliacoes = serializers.IntegerField(read_only=True)
    imagem_url = serializers.SerializerMethodField()

    class Meta:
        model = Produto
        fields = [
            'id', 'nome', 'slug', 'preco', 'preco_promocional', 'preco_final',
            'tem_promocao', 'disponivel', 'estoque', 'destaque', 'categoria',
            'imagem_url', 'media_avaliacoes', 'total_avaliacoes',
        ]

    def get_imagem_url(self, obj):
        request = self.context.get('request')
        if obj.imagem and request:
            return request.build_absolute_uri(obj.imagem.url)
        return None


class ProdutoDetailSerializer(ProdutoListSerializer):
    avaliacoes = AvaliacaoSerializer(many=True, read_only=True)
    usuario_ja_avaliou = serializers.SerializerMethodField()

    class Meta(ProdutoListSerializer.Meta):
        fields = ProdutoListSerializer.Meta.fields + [
            'descricao', 'avaliacoes', 'usuario_ja_avaliou', 'criado_em',
        ]

    def get_usuario_ja_avaliou(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.avaliacoes.filter(usuario=request.user).exists()
        return False
