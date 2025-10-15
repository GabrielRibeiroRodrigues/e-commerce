"""
URL configuration for queops project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Customização do Admin
admin.site.site_header = 'Farmácia QUEOPS - Administração'
admin.site.site_title = 'QUEOPS Admin'
admin.site.index_title = 'Painel de Controle'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('produtos/', include('produtos.urls')),
    path('usuarios/', include('usuarios.urls')),
    path('pedidos/', include('pedidos.urls')),
]

# Configuração para servir arquivos de media em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
