# E-Commerce Platform# Farmácia QUEOPS - Plataforma E-commerce#  Farmácia QUEOPS - E-commerce



Plataforma completa de e-commerce desenvolvida com Django, oferecendo experiência moderna e responsiva para compras online.



## Tecnologias UtilizadasSistema completo de e-commerce desenvolvido para a Farmácia QUEOPS. Implementa fluxo completo de venda online com gestão de produtos, carrinho de compras, checkout integrado e área de administração.E-commerce completo desenvolvido em Django para a **Farmácia QUEOPS**, com sistema de gerenciamento de produtos, carrinho de compras, checkout e autenticação de usuários.



- **Backend**: Django 5.2.7, Python 3.12

- **Frontend**: Tailwind CSS 3.x, Alpine.js 3.x

- **Banco de Dados**: SQLite (desenvolvimento), PostgreSQL (produção)## Sobre o Projeto##  Tecnologias Utilizadas

- **Servidor**: Gunicorn + WhiteNoise



## Funcionalidades

Aplicação web construída para atender as necessidades de vendas online de uma farmácia de médio porte. O sistema foi desenvolvido priorizando simplicidade no frontend e robustez no backend, sem dependência de frameworks JavaScript complexos.- **Backend:** Django 5.2.7

- Sistema de autenticação com login social (Google)

- Catálogo de produtos com busca e filtros- **Frontend:** HTML5, CSS3 (puro)

- Carrinho de compras com cálculo de frete

- Sistema de avaliações e reviews## Principais Recursos- **Banco de Dados:** SQLite

- Painel administrativo completo

- Notificações toast interativas- **Bibliotecas:** Pillow (para gerenciamento de imagens)

- Skeleton loaders para melhor UX

- Animações CSS profissionais**Para Clientes:**

- Breadcrumb navigation

- Acessibilidade WCAG 2.1 AA- Navegação por catálogo com filtros e busca## ✨ Funcionalidades

- Sinais de confiança e trust badges

- Design responsivo- Sistema de favoritos (wishlist)



## Instalação Local- Carrinho com atualização dinâmica# Farmácia QUEOPS – Plataforma de E-commerce



### Pré-requisitos- Checkout com cálculo automático de frete



- Python 3.12+- Histórico completo de pedidosAplicação web completa construída com Django para a Farmácia QUEOPS. O projeto cobre o fluxo de venda ponta a ponta: catálogo de produtos, carrinho, checkout com cálculo de frete, pagamento integrado e experiência autenticada para clientes e administradores.

- pip

- Virtualenv (recomendado)- Login tradicional e integração com Google



### Passos---



1. Clone o repositório:**Para Administradores:**

```bash

git clone <url-do-repositorio>- Painel administrativo completo## Sumário

cd e-commerce

```- Gestão de produtos e categorias



2. Crie e ative um ambiente virtual:- Controle de estoque automático- [Visão Geral](#visão-geral)

```bash

python -m venv venv- Acompanhamento de pedidos- [Principais Funcionalidades](#principais-funcionalidades)

venv\Scripts\activate  # Windows

source venv/bin/activate  # Linux/Mac- Registro de transações- [Arquitetura e Tecnologia](#arquitetura-e-tecnologia)

```

- [Preparação do Ambiente](#preparação-do-ambiente)

3. Instale as dependências:

```bash## Stack Tecnológica- [Execução Local](#execução-local)

pip install -r requirements.txt

```- [Variáveis de Ambiente](#variáveis-de-ambiente)



4. Configure as variáveis de ambiente:```- [Pagamentos e Frete](#pagamentos-e-frete)

```bash

cp .env.example .envBackend:        Python 3.12 + Django 5.2.7- [Contas de Acesso de Demonstração](#contas-de-acesso-de-demonstracao)

```

Database:       SQLite (desenvolvimento), PostgreSQL (produção)- [Mapa de Rotas](#mapa-de-rotas)

Edite o arquivo `.env` e configure:

- `SECRET_KEY`: Gere uma chave secreta seguraFrontend:       HTML5, CSS3- [Roadmap](#roadmap)

- `DEBUG`: True para desenvolvimento

- `ALLOWED_HOSTS`: localhost,127.0.0.1Dependências:   Pillow, python-dotenv- [Créditos](#créditos)

- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (opcional)

```

5. Execute as migrações:

```bash---

python manage.py migrate

```## Estrutura do Projeto



6. Crie um superusuário:## Visão Geral

```bash

python manage.py createsuperuser```

```

queops/A solução foi desenhada para uma farmácia de médio porte que deseja vender on-line sem dependências de frameworks front-end pesados. A interface utiliza HTML e CSS puros, com foco em clareza e acessibilidade, enquanto o back-end Django garante segurança, escalabilidade e manutenção facilitada.

7. Colete arquivos estáticos:

```bash├── core/           Landing page e institucional

python manage.py collectstatic

```├── produtos/       Catálogo e gestão de produtos---



8. Inicie o servidor:├── usuarios/       Autenticação e perfis

```bash

python manage.py runserver├── pedidos/        Carrinho, checkout e pagamentos## Principais Funcionalidades

```

├── templates/      Templates compartilhados

Acesse: http://localhost:8000

├── static/         Assets estáticos (CSS, JS, imagens)### Experiência do Cliente

## Deploy na Vercel

├── media/          Upload de imagens de produtos- Catálogo com filtros, busca e sinalização de promoções.

### Pré-requisitos

└── queops/         Configurações centrais- Página de detalhes com informações completas do produto e integração com wishlist.

- Conta no GitHub

- Conta na Vercel```- Carrinho com atualização de quantidades e feedback imediato.

- Repositório Git configurado

- Checkout com validação de endereço, cálculo de frete por CEP e captura de pagamento.

### Preparação

## Instalação- Histórico de pedidos e acompanhamento pós-compra em área autenticada.

O projeto já está configurado para deploy na Vercel com:

- `vercel.json`: Configuração de runtime e rotas- Autenticação tradicional e login social via Google OAuth 2.0.

- `build.sh`: Script de build automático

- `.vercelignore`: Arquivos excluídos do deploy```bash

- `requirements.txt`: Dependências otimizadas

- WhiteNoise: Servir arquivos estáticos# Clonar repositório### Operações e Backoffice

- Variáveis de ambiente: Configuração segura

git clone https://github.com/GabrielRibeiroRodrigues/e-commerce.git- Painel administrativo customizado (Django Admin) com visão dos pedidos e itens.

### Limitações Importantes

cd e-commerce- Controle automático de estoque e status do pedido.

**Banco de Dados**: SQLite não funciona na Vercel (ambiente serverless reinicia). Opções:

- Gestão de catálogo (categorias, promoções, destaques, imagens de produto).

1. **Vercel Postgres** (Recomendado)

   - Integração nativa# Criar ambiente virtual- Registro das transações financeiras associadas a cada pedido.

   - Configure em: vercel.com → seu projeto → Storage → Postgres

python -m venv venv

2. **Supabase** (Grátis)

   - PostgreSQL gerenciado./venv/Scripts/activate---

   - URL de conexão via variáveis de ambiente



3. **PlanetScale** (MySQL)

   - Plano gratuito disponível# Instalar dependências## Arquitetura e Tecnologia

   - Boa performance

pip install django pillow python-dotenv

**Arquivos de Mídia**: Uploads não persistem em ambiente serverless. Opções:

| Camada | Tecnologias |

1. **Vercel Blob Storage**

   - Integração nativa# Aplicar migrações| --- | --- |

   - Configuração simples

python manage.py migrate| Back-end | Python 3.12, Django 5.2.7 |

2. **Cloudinary**

   - Plano gratuito generoso| Banco de dados | SQLite (ambiente local). Adaptável para PostgreSQL/MySQL |

   - Otimização automática de imagens

# Popular banco de dados (opcional)| Front-end | HTML5, CSS3 (design responsivo) |

3. **AWS S3**

   - Escalávelpython popular_dados.py| Dependências essenciais | Pillow (imagens), python-dotenv (carregamento do `.env`) |

   - Requer configuração adicional



### Passo a Passo

# Iniciar servidorEstrutura de diretórios principal:

1. **Commit e Push**:

```bashpython manage.py runserver

git add .

git commit -m "Prepara projeto para deploy"``````

git push origin main

```queops/



2. **Importe no Vercel**:Acesse: `http://127.0.0.1:8000/`├── core/               # Landing page e conteúdo institucional

   - Acesse: vercel.com/new

   - Selecione seu repositório GitHub├── produtos/           # Regras de catálogo e exibição

   - Vercel detectará Django automaticamente

## Configuração├── usuarios/           # Autenticação, perfis, social login

3. **Configure Variáveis de Ambiente**:

├── pedidos/            # Carrinho, checkout, frete, pagamentos

Na aba "Environment Variables", adicione:

Crie um arquivo `.env` na raiz com as credenciais necessárias:├── templates/          # Templates HTML compartilhados

```

SECRET_KEY=sua-secret-key-super-secreta-aqui-mude-isso├── static/             # CSS, imagens e assets estáticos

DEBUG=False

ALLOWED_HOSTS=.vercel.app```env├── media/              # Uploads gerenciados pelo admin

DATABASE_URL=postgres://usuario:senha@host:5432/database

```GOOGLE_CLIENT_ID=your_client_id└── queops/             # Configurações de projeto e URLs globais



Para gerar uma SECRET_KEY segura:GOOGLE_CLIENT_SECRET=your_client_secret```

```bash

python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"SECRET_KEY=your_django_secret_key

```

DEBUG=True---

4. **Deploy**:

   - Clique em "Deploy"```

   - Aguarde o build (1-3 minutos)

   - Acesse a URL fornecida## Preparação do Ambiente



5. **Pós-Deploy**:### OAuth Google



Execute as migrações (uma vez):```bash

```bash

vercel env pull .env.productionPara habilitar login social:git clone <url-do-repositorio>

python manage.py migrate --settings=queops.settings

```cd e-commerce



Crie um superusuário:1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)

```bash

python manage.py createsuperuser2. Crie credenciais OAuth 2.0python -m venv venv

```

3. Configure URI de redirecionamento:./venv/Scripts/activate   # Windows

### Configuração de Banco de Dados PostgreSQL

   - Desenvolvimento: `http://localhost:8000/usuarios/login/google/callback/`# source venv/bin/activate  # Linux/macOS

Atualize `queops/settings.py` para produção:

   - Produção: adicione seu domínio oficial

```python

import dj_database_urlpip install django pillow python-dotenv



if not DEBUG:## Funcionalidades Implementadas```

    DATABASES = {

        'default': dj_database_url.config(

            default=os.getenv('DATABASE_URL'),

            conn_max_age=600**Pagamentos**---

        )

    }- Sistema de gateway simulado

```

- Suporte a múltiplos métodos (cartão, PIX, boleto)## Execução Local

Adicione ao `requirements.txt`:

```- Registro completo de transações

dj-database-url==2.1.0

psycopg2-binary==2.9.9```bash

```

**Frete**# Aplicar migrações

### Checklist de Segurança

- Cálculo automático por CEPpython manage.py migrate

Antes do deploy, verifique:

- Tabela regionalizada de preços

- [ ] `SECRET_KEY` definida via variável de ambiente

- [ ] `DEBUG=False` em produção- Validação de endereço# (opcional) Popular base de dados de exemplo

- [ ] `ALLOWED_HOSTS` configurado corretamente

- [ ] Arquivo `.env` no `.gitignore`python popular_dados.py

- [ ] `db.sqlite3` no `.gitignore`

- [ ] HTTPS habilitado (automático na Vercel)**Autenticação**

- [ ] CSRF configurado para domínio de produção

- Login tradicional (email/senha)# Subir servidor de desenvolvimento

### Monitoramento

- Integração OAuth com Googlepython manage.py runserver

Acesse logs em tempo real:

```bash- Sistema de recuperação de senha```

vercel logs <url-do-projeto>

```



Ou pelo dashboard: vercel.com → seu projeto → Logs## Contas de TesteA aplicação ficará disponível em `http://127.0.0.1:8000/`.



### Troubleshooting



**Erro: "Application Error"**Após executar `popular_dados.py`:---

- Verifique logs: `vercel logs`

- Confirme variáveis de ambiente

- Valide `ALLOWED_HOSTS`

| Tipo          | Usuário   | Senha      | Acesso        |## Variáveis de Ambiente

**Erro: "Static files not found"**

- Execute: `python manage.py collectstatic`|---------------|-----------|------------|---------------|

- Verifique configuração WhiteNoise

| Administrador | admin     | admin123   | /admin/       |Crie um arquivo `.env` na raiz do projeto com os seguintes valores (exemplo):

**Erro: "Database connection failed"**

- Valide `DATABASE_URL`| Cliente       | cliente   | cliente123 | Área do usuário |

- Confirme credenciais do PostgreSQL

- Teste conexão localmente```



## Estrutura do Projeto## Principais RotasGOOGLE_CLIENT_ID=seu_client_id



```GOOGLE_CLIENT_SECRET=sua_chave

e-commerce/

├── queops/                 # Configurações Django``````

│   ├── settings.py        # Configurações principais

│   ├── urls.py           # Rotas principais/                           - Homepage

│   └── wsgi.py           # Entry point WSGI

├── core/                  # App principal/produtos/                  - CatálogoAs variáveis são carregadas automaticamente durante a inicialização. Para produção, recomenda-se configurar esses valores diretamente no ambiente de execução.

│   ├── models.py         # Modelos de dados

│   ├── views.py          # Views/produtos/<slug>/           - Detalhes do produto

│   ├── urls.py           # Rotas do app

│   └── admin.py          # Configuração admin/pedidos/carrinho/          - Carrinho### Configuração do Google OAuth

├── templates/             # Templates HTML

│   ├── base.html         # Template base/pedidos/checkout/          - Finalização

│   └── core/             # Templates do core

├── static/                # Arquivos estáticos/usuarios/registro/         - Cadastro1. Crie credenciais OAuth 2.0 do tipo “Aplicativo Web” no [Google Cloud Console](https://console.cloud.google.com/).

│   ├── css/              # Estilos CSS

│   ├── js/               # JavaScript/usuarios/login/            - Login2. Autorização para desenvolvimento:

│   └── images/           # Imagens

├── media/                 # Uploads de usuários/usuarios/perfil/           - Área do cliente	- **URI de redirecionamento:** `http://localhost:8000/usuarios/login/google/callback/`

├── vercel.json           # Config Vercel

├── build.sh              # Script de build/admin/                     - Painel admin	- **Origem JavaScript (opcional):** `http://localhost:8000`

├── requirements.txt      # Dependências Python

└── manage.py             # CLI Django```3. Em produção, adicione os domínios definitivos nas listas de origens e redirecionamentos.

```



## Variáveis de Ambiente

## Próximas Implementações---

Arquivo `.env` completo:



```env

# Django- Sistema de notificações por email## Pagamentos e Frete

SECRET_KEY=sua-secret-key-super-secreta-aqui

DEBUG=True- Avaliações e comentários de produtos

ALLOWED_HOSTS=localhost,127.0.0.1

- Cupons de desconto- **Frete por CEP:** cálculo escalonado por região com feedback imediato ao usuário.

# Database (Produção)

DATABASE_URL=postgres://user:password@host:5432/dbname- Dashboard de analytics para admin- **Pagamentos simulados:** gateway fictício que representa Cartão de Crédito, Pix e Boleto, registrando status e códigos de autorização para cada pedido.



# Google OAuth (Opcional)- API REST

GOOGLE_CLIENT_ID=seu-client-id-aqui

GOOGLE_CLIENT_SECRET=seu-client-secret-aqui- Testes automatizadosAs regras do pagamento estão encapsuladas em `pedidos/services.py`, mantendo o domínio pronto para integração real no futuro.



# Email (Opcional)

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

EMAIL_HOST=smtp.gmail.com## Licença---

EMAIL_PORT=587

EMAIL_USE_TLS=True

EMAIL_HOST_USER=seu-email@gmail.com

EMAIL_HOST_PASSWORD=sua-senha-de-appProjeto desenvolvido para fins educacionais.## Contas de Acesso de Demonstração



# Storage (Produção - Opcional)

CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

AWS_ACCESS_KEY_ID=sua-chave-aws---Disponíveis após executar `popular_dados.py`:

AWS_SECRET_ACCESS_KEY=seu-secret-aws

AWS_STORAGE_BUCKET_NAME=seu-bucket

```

**Farmácia QUEOPS** - Cuidando da sua saúde| Perfil | Usuário | Senha | Observações |

## Comandos Úteis

| --- | --- | --- | --- |

### Desenvolvimento| Administrador | `admin` | `admin123` | Acesso ao Django Admin (`/admin/`) |

```bash| Cliente | `cliente` | `cliente123` | Perfil de compras para testes |

python manage.py runserver          # Inicia servidor

python manage.py makemigrations     # Cria migrações---

python manage.py migrate            # Aplica migrações

python manage.py createsuperuser    # Cria admin## Mapa de Rotas

python manage.py collectstatic      # Coleta estáticos

python manage.py shell              # Shell interativo| Endpoint | Descrição |

```| --- | --- |

| `/` | Página inicial |

### Testes| `/produtos/` | Catálogo completo |

```bash| `/produtos/<slug>/` | Detalhes do produto |

python manage.py test               # Executa testes| `/pedidos/carrinho/` | Carrinho de compras |

python manage.py test core          # Testa app específico| `/pedidos/checkout/` | Processo de checkout |

```| `/usuarios/registro/` | Cadastro de clientes |

| `/usuarios/login/` | Login tradicional |

### Produção| `/usuarios/login/google/` | Início do fluxo Google |

```bash| `/usuarios/perfil/` | Histórico de pedidos |

gunicorn queops.wsgi:application    # Inicia Gunicorn| `/admin/` | Painel administrativo |

python manage.py check --deploy     # Verifica config produção

```---



## Contribuindo## Roadmap



1. Fork o projeto- [x] Integração de pagamento e registro de transações

2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`- [x] Wishlist para clientes autenticados

3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`- [x] Cálculo de frete por CEP

4. Push para a branch: `git push origin feature/nova-funcionalidade`- [x] Login social (Google OAuth)

5. Abra um Pull Request- [ ] Envio de e-mails transacionais

- [ ] Sistema de avaliações de produtos

## Licença- [ ] Cupons e promoções avançadas

- [ ] Dashboard analítico para administradores

Este projeto está sob a licença MIT.- [ ] API REST para integrações externas

- [ ] Cobertura de testes automatizados

## Suporte

---

Para dúvidas ou problemas:

- Abra uma issue no GitHub## Créditos

- Consulte a documentação do Django: docs.djangoproject.com

- Documentação da Vercel: vercel.com/docsProjeto desenvolvido para fins educacionais dentro da iniciativa Farmácia QUEOPS.


---

**Farmácia QUEOPS – sua saúde em primeiro lugar.**
- [ ] Envio de e-mails transacionais
