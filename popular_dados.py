"""
Script para popular o banco de dados com dados de exemplo
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'queops.settings')
django.setup()

from django.contrib.auth.models import User
from produtos.models import Categoria, Produto
from decimal import Decimal

def criar_dados():
    print("🏥 Populando banco de dados da Farmácia QUEOPS...")
    
    # Criar superusuário
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@queops.com', 'admin123')
        print("✅ Superusuário criado: admin / admin123")
    
    # Criar usuário de teste
    if not User.objects.filter(username='cliente').exists():
        User.objects.create_user('cliente', 'cliente@email.com', 'cliente123')
        print("✅ Usuário de teste criado: cliente / cliente123")
    
    # Criar categorias
    categorias_data = [
        {'nome': 'Medicamentos', 'descricao': 'Medicamentos de uso contínuo e ocasional'},
        {'nome': 'Vitaminas', 'descricao': 'Suplementos vitamínicos e minerais'},
        {'nome': 'Dermocosméticos', 'descricao': 'Produtos para cuidados com a pele'},
        {'nome': 'Higiene', 'descricao': 'Produtos de higiene pessoal'},
        {'nome': 'Infantil', 'descricao': 'Produtos para bebês e crianças'},
    ]
    
    categorias = {}
    for cat_data in categorias_data:
        cat, created = Categoria.objects.get_or_create(
            nome=cat_data['nome'],
            defaults={'descricao': cat_data['descricao']}
        )
        categorias[cat.nome] = cat
        if created:
            print(f"✅ Categoria criada: {cat.nome}")
    
    # Criar produtos
    produtos_data = [
        # Medicamentos
        {
            'nome': 'Dipirona Sódica 500mg',
            'descricao': 'Analgésico e antitérmico para dores leves a moderadas e febre. Embalagem com 20 comprimidos.',
            'preco': Decimal('12.90'),
            'preco_promocional': Decimal('9.90'),
            'categoria': categorias['Medicamentos'],
            'estoque': 150,
            'destaque': True,
        },
        {
            'nome': 'Paracetamol 750mg',
            'descricao': 'Analgésico e antitérmico eficaz. Caixa com 20 comprimidos.',
            'preco': Decimal('15.50'),
            'categoria': categorias['Medicamentos'],
            'estoque': 200,
            'destaque': True,
        },
        {
            'nome': 'Omeprazol 20mg',
            'descricao': 'Medicamento para tratamento de acidez estomacal e refluxo. 30 cápsulas.',
            'preco': Decimal('24.90'),
            'preco_promocional': Decimal('19.90'),
            'categoria': categorias['Medicamentos'],
            'estoque': 80,
            'destaque': False,
        },
        {
            'nome': 'Ibuprofeno 600mg',
            'descricao': 'Anti-inflamatório e analgésico. Embalagem com 30 comprimidos.',
            'preco': Decimal('22.00'),
            'categoria': categorias['Medicamentos'],
            'estoque': 120,
            'destaque': False,
        },
        
        # Vitaminas
        {
            'nome': 'Vitamina C 1000mg',
            'descricao': 'Suplemento de vitamina C para fortalecer o sistema imunológico. 60 comprimidos efervescentes.',
            'preco': Decimal('35.90'),
            'preco_promocional': Decimal('29.90'),
            'categoria': categorias['Vitaminas'],
            'estoque': 95,
            'destaque': True,
        },
        {
            'nome': 'Complexo B',
            'descricao': 'Vitaminas do complexo B para energia e disposição. 60 cápsulas.',
            'preco': Decimal('28.50'),
            'categoria': categorias['Vitaminas'],
            'estoque': 70,
            'destaque': False,
        },
        {
            'nome': 'Ômega 3',
            'descricao': 'Suplemento de óleo de peixe rico em EPA e DHA. 120 cápsulas.',
            'preco': Decimal('45.00'),
            'preco_promocional': Decimal('39.90'),
            'categoria': categorias['Vitaminas'],
            'estoque': 50,
            'destaque': True,
        },
        {
            'nome': 'Vitamina D3 2000UI',
            'descricao': 'Suplemento de vitamina D para saúde óssea. 60 cápsulas.',
            'preco': Decimal('32.00'),
            'categoria': categorias['Vitaminas'],
            'estoque': 85,
            'destaque': False,
        },
        
        # Dermocosméticos
        {
            'nome': 'Protetor Solar FPS 50',
            'descricao': 'Proteção solar de amplo espectro. Resistente à água. 120ml.',
            'preco': Decimal('65.90'),
            'preco_promocional': Decimal('55.90'),
            'categoria': categorias['Dermocosméticos'],
            'estoque': 45,
            'destaque': True,
        },
        {
            'nome': 'Hidratante Facial',
            'descricao': 'Creme hidratante para rosto com ácido hialurônico. 50g.',
            'preco': Decimal('48.00'),
            'categoria': categorias['Dermocosméticos'],
            'estoque': 60,
            'destaque': False,
        },
        {
            'nome': 'Sérum Vitamina C',
            'descricao': 'Sérum antioxidante para iluminação e rejuvenescimento da pele. 30ml.',
            'preco': Decimal('89.90'),
            'categoria': categorias['Dermocosméticos'],
            'estoque': 35,
            'destaque': False,
        },
        
        # Higiene
        {
            'nome': 'Álcool em Gel 70%',
            'descricao': 'Antisséptico para higienização das mãos. 500ml.',
            'preco': Decimal('12.90'),
            'preco_promocional': Decimal('9.90'),
            'categoria': categorias['Higiene'],
            'estoque': 250,
            'destaque': False,
        },
        {
            'nome': 'Sabonete Líquido Antibacteriano',
            'descricao': 'Sabonete líquido para higienização das mãos. 250ml.',
            'preco': Decimal('15.90'),
            'categoria': categorias['Higiene'],
            'estoque': 180,
            'destaque': False,
        },
        
        # Infantil
        {
            'nome': 'Fralda Descartável Tamanho M',
            'descricao': 'Fraldas com alta absorção e proteção. Pacote com 48 unidades.',
            'preco': Decimal('42.90'),
            'preco_promocional': Decimal('38.90'),
            'categoria': categorias['Infantil'],
            'estoque': 65,
            'destaque': True,
        },
        {
            'nome': 'Lenço Umedecido',
            'descricao': 'Lenços umedecidos para bebês. Embalagem com 100 unidades.',
            'preco': Decimal('18.50'),
            'categoria': categorias['Infantil'],
            'estoque': 120,
            'destaque': False,
        },
        {
            'nome': 'Shampoo Infantil',
            'descricao': 'Shampoo suave para cabelos de bebês e crianças. 400ml.',
            'preco': Decimal('22.90'),
            'categoria': categorias['Infantil'],
            'estoque': 90,
            'destaque': False,
        },
    ]
    
    for prod_data in produtos_data:
        prod, created = Produto.objects.get_or_create(
            nome=prod_data['nome'],
            defaults=prod_data
        )
        if created:
            print(f"✅ Produto criado: {prod.nome}")
    
    print("\n🎉 Banco de dados populado com sucesso!")
    print("\n📊 Resumo:")
    print(f"   - Categorias: {Categoria.objects.count()}")
    print(f"   - Produtos: {Produto.objects.count()}")
    print(f"   - Usuários: {User.objects.count()}")
    print("\n🔐 Credenciais de acesso:")
    print("   Admin: admin / admin123")
    print("   Cliente: cliente / cliente123")

if __name__ == '__main__':
    criar_dados()
