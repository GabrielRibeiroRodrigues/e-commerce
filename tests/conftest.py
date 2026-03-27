import pytest
from rest_framework.test import APIClient
from tests.factories import UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def usuario(db):
    return UserFactory()


@pytest.fixture
def api_autenticado(api_client, usuario):
    """Client já autenticado via JWT."""
    from rest_framework_simplejwt.tokens import RefreshToken
    token = RefreshToken.for_user(usuario)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
    return api_client
