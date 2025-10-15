# 🏥 Farmácia QUEOPS - E-commerce

E-commerce completo desenvolvido em Django para a **Farmácia QUEOPS**, com sistema de gerenciamento de produtos, carrinho de compras, checkout e autenticação de usuários.

## 🚀 Tecnologias Utilizadas

- **Backend:** Django 5.2.7
- **Frontend:** HTML5, CSS3 (puro)
- **Banco de Dados:** SQLite
- **Bibliotecas:** Pillow (para gerenciamento de imagens)

## ✨ Funcionalidades

### 🛍️ Para Clientes
- ✅ Navegação por produtos com filtros e busca
- ✅ Visualização detalhada de produtos
- ✅ Carrinho de compras (adicionar, remover, atualizar quantidades)
- ✅ Sistema de checkout com informações de entrega
- ✅ Registro e login de usuários
- ✅ Login Social com Google
- ✅ Perfil do usuário com histórico de pedidos
- ✅ Produtos em destaque e promoções

### 🔧 Para Administradores
- ✅ Painel administrativo Django customizado
- ✅ CRUD completo de produtos e categorias
- ✅ Gerenciamento de pedidos e status
- ✅ Controle de estoque automático
- ✅ Upload de imagens de produtos

## 🎨 Design

- Tema verde e branco (identidade farmacêutica)
- Layout responsivo
- Interface intuitiva e amigável
- Feedback visual para ações do usuário

## 📦 Estrutura do Projeto

```
queops/
├── core/              # App principal (home)
├── produtos/          # Gerenciamento de produtos
├── usuarios/          # Autenticação e perfil
├── pedidos/           # Carrinho e checkout
├── templates/         # Templates HTML
├── static/            # Arquivos CSS e imagens
├── media/             # Uploads (imagens de produtos)
└── queops/            # Configurações do projeto
```

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd e-commerce
```

### 2. Crie e ative o ambiente virtual
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac
```

### 3. Instale as dependências
```bash
pip install django pillow python-dotenv
```

### 4. Execute as migrações
```bash
python manage.py migrate
```

### 5. Popule o banco de dados (opcional)
```bash
python popular_dados.py
```

Este script criará:
- 2 usuários (admin e cliente)
- 5 categorias de produtos
- 16 produtos de exemplo

### 6. Inicie o servidor
```bash
python manage.py runserver
```

Acesse: `http://127.0.0.1:8000/`

### ☁️ Login com Google (opcional)

Para habilitar o login social, crie credenciais OAuth 2.0 no console do Google Cloud e defina as variáveis de ambiente antes de subir o servidor:

```bash
set GOOGLE_CLIENT_ID=seu_client_id      # Windows PowerShell/CMD
set GOOGLE_CLIENT_SECRET=sua_chave

# No Linux/macOS:
export GOOGLE_CLIENT_ID=seu_client_id
export GOOGLE_CLIENT_SECRET=sua_chave
```

Configure o URI de redirecionamento como:

```
http://localhost:8000/usuarios/login/google/callback/
```

Com os dados definidos, o botão "Entrar com Google" aparecerá automaticamente na tela de login.

> Dica: você pode criar um arquivo `.env` na raiz do projeto contendo `GOOGLE_CLIENT_ID=` e `GOOGLE_CLIENT_SECRET=`. O Django carregará esses valores automaticamente quando o servidor iniciar.

## 🔐 Credenciais de Acesso

Após executar o script `popular_dados.py`:

**Administrador:**
- Usuário: `admin`
- Senha: `admin123`
- Painel: `http://127.0.0.1:8000/admin/`

**Cliente de Teste:**
- Usuário: `cliente`
- Senha: `cliente123`

## 📱 Páginas Disponíveis

- `/` - Página inicial
- `/produtos/` - Lista de produtos
- `/produtos/<slug>/` - Detalhes do produto
- `/pedidos/carrinho/` - Carrinho de compras
- `/pedidos/checkout/` - Finalizar compra
- `/usuarios/registro/` - Cadastro
- `/usuarios/login/` - Login
- `/usuarios/perfil/` - Perfil do usuário
- `/admin/` - Painel administrativo

## 🛒 Fluxo de Compra

1. **Navegação:** Cliente navega pelos produtos
2. **Adicionar ao Carrinho:** Seleciona produtos e quantidades
3. **Revisão:** Visualiza o carrinho e ajusta itens
4. **Login:** Faz login ou cria uma conta
5. **Checkout:** Preenche dados de entrega
6. **Confirmação:** Recebe confirmação do pedido
7. **Histórico:** Acompanha pedidos no perfil

## 🎯 Recursos Técnicos

### Models
- `Categoria` - Categorização de produtos
- `Produto` - Produtos da farmácia
- `Pedido` - Pedidos dos clientes
- `ItemPedido` - Itens de cada pedido

### Views
- **Class-Based Views** para operações complexas
- **Function-Based Views** para páginas simples
- Decoradores de autenticação (@login_required)
- Context processors customizados

### Templates
- Sistema de herança (base.html)
- Template tags do Django
- Filtros personalizados
- Mensagens de feedback

### Admin
- Interface customizada
- Inlines para itens de pedido
- Filtros e buscas avançadas
- Campos editáveis em lista

## 🔒 Segurança

- Proteção CSRF em formulários
- Autenticação de usuários
- Controle de acesso por decorators
- Validação de estoque em tempo real

## 📊 Banco de Dados

O projeto utiliza SQLite por padrão. Para usar PostgreSQL ou MySQL:

1. Instale o driver apropriado
2. Modifique `DATABASES` em `settings.py`
3. Execute as migrações novamente

## 🚧 Próximas Melhorias (Sugestões)

- [x] Sistema de pagamento integrado
- [ ] Envio de e-mails transacionais
- [ ] Sistema de avaliações de produtos
- [x] Wishlist (lista de desejos)
- [ ] Cupons de desconto
- [x] Cálculo de frete por CEP
- [ ] Dashboard de vendas para admin
- [ ] API REST para integração mobile
- [ ] Testes automatizados

## 📝 Licença

Projeto desenvolvido para fins educacionais.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para a Farmácia QUEOPS

---

**Farmácia QUEOPS** - Sua saúde e bem-estar são nossa prioridade! 🏥
