from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from produtos.serializers import ProdutoListSerializer
from usuarios.models import ListaDesejo


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este e-mail já está em uso.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'As senhas não coincidem.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('Este e-mail já está em uso.')
        return value


class ListaDesejoSerializer(serializers.ModelSerializer):
    produto = ProdutoListSerializer(read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('produtos.models', fromlist=['Produto']).Produto.objects.filter(ativo=True),
        write_only=True,
        source='produto',
    )

    class Meta:
        model = ListaDesejo
        fields = ['id', 'produto', 'produto_id', 'criado_em']
        read_only_fields = ['id', 'criado_em']

    def validate(self, data):
        usuario = self.context['request'].user
        produto = data['produto']
        if ListaDesejo.objects.filter(usuario=usuario, produto=produto).exists():
            raise serializers.ValidationError('Este produto já está na sua lista de desejos.')
        return data

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
