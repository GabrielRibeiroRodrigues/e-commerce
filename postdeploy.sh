#!/bin/bash
# Script para executar após o deploy na Vercel

echo "Aplicando migrações do banco de dados..."
python manage.py migrate --noinput

echo "Criando superusuário (se não existir)..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@queops.com', 'changeme123')
    print('Superusuário criado: admin / changeme123')
else:
    print('Superusuário já existe')
EOF

echo "Deploy concluído!"
