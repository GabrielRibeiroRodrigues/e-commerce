# Farmácia QUEOPS - Plataforma E-commerce# 🏥 Farmácia QUEOPS - E-commerce



Sistema completo de e-commerce desenvolvido para a Farmácia QUEOPS. Implementa fluxo completo de venda online com gestão de produtos, carrinho de compras, checkout integrado e área de administração.E-commerce completo desenvolvido em Django para a **Farmácia QUEOPS**, com sistema de gerenciamento de produtos, carrinho de compras, checkout e autenticação de usuários.



## Sobre o Projeto## 🚀 Tecnologias Utilizadas



Aplicação web construída para atender as necessidades de vendas online de uma farmácia de médio porte. O sistema foi desenvolvido priorizando simplicidade no frontend e robustez no backend, sem dependência de frameworks JavaScript complexos.- **Backend:** Django 5.2.7

- **Frontend:** HTML5, CSS3 (puro)

## Principais Recursos- **Banco de Dados:** SQLite

- **Bibliotecas:** Pillow (para gerenciamento de imagens)

**Para Clientes:**

- Navegação por catálogo com filtros e busca## ✨ Funcionalidades

- Sistema de favoritos (wishlist)

- Carrinho com atualização dinâmica# Farmácia QUEOPS – Plataforma de E-commerce

- Checkout com cálculo automático de frete

- Histórico completo de pedidosAplicação web completa construída com Django para a Farmácia QUEOPS. O projeto cobre o fluxo de venda ponta a ponta: catálogo de produtos, carrinho, checkout com cálculo de frete, pagamento integrado e experiência autenticada para clientes e administradores.

- Login tradicional e integração com Google

---

**Para Administradores:**

- Painel administrativo completo## Sumário

- Gestão de produtos e categorias

- Controle de estoque automático- [Visão Geral](#visão-geral)

- Acompanhamento de pedidos- [Principais Funcionalidades](#principais-funcionalidades)

- Registro de transações- [Arquitetura e Tecnologia](#arquitetura-e-tecnologia)

- [Preparação do Ambiente](#preparação-do-ambiente)

## Stack Tecnológica- [Execução Local](#execução-local)

- [Variáveis de Ambiente](#variáveis-de-ambiente)

```- [Pagamentos e Frete](#pagamentos-e-frete)

Backend:        Python 3.12 + Django 5.2.7- [Contas de Acesso de Demonstração](#contas-de-acesso-de-demonstracao)

Database:       SQLite (desenvolvimento), PostgreSQL (produção)- [Mapa de Rotas](#mapa-de-rotas)

Frontend:       HTML5, CSS3- [Roadmap](#roadmap)

Dependências:   Pillow, python-dotenv- [Créditos](#créditos)

```

---

## Estrutura do Projeto

## Visão Geral

```

queops/A solução foi desenhada para uma farmácia de médio porte que deseja vender on-line sem dependências de frameworks front-end pesados. A interface utiliza HTML e CSS puros, com foco em clareza e acessibilidade, enquanto o back-end Django garante segurança, escalabilidade e manutenção facilitada.

├── core/           Landing page e institucional

├── produtos/       Catálogo e gestão de produtos---

├── usuarios/       Autenticação e perfis

├── pedidos/        Carrinho, checkout e pagamentos## Principais Funcionalidades

├── templates/      Templates compartilhados

├── static/         Assets estáticos (CSS, JS, imagens)### Experiência do Cliente

├── media/          Upload de imagens de produtos- Catálogo com filtros, busca e sinalização de promoções.

└── queops/         Configurações centrais- Página de detalhes com informações completas do produto e integração com wishlist.

```- Carrinho com atualização de quantidades e feedback imediato.

- Checkout com validação de endereço, cálculo de frete por CEP e captura de pagamento.

## Instalação- Histórico de pedidos e acompanhamento pós-compra em área autenticada.

- Autenticação tradicional e login social via Google OAuth 2.0.

```bash

# Clonar repositório### Operações e Backoffice

git clone https://github.com/GabrielRibeiroRodrigues/e-commerce.git- Painel administrativo customizado (Django Admin) com visão dos pedidos e itens.

cd e-commerce- Controle automático de estoque e status do pedido.

- Gestão de catálogo (categorias, promoções, destaques, imagens de produto).

# Criar ambiente virtual- Registro das transações financeiras associadas a cada pedido.

python -m venv venv

./venv/Scripts/activate---



# Instalar dependências## Arquitetura e Tecnologia

pip install django pillow python-dotenv

| Camada | Tecnologias |

# Aplicar migrações| --- | --- |

python manage.py migrate| Back-end | Python 3.12, Django 5.2.7 |

| Banco de dados | SQLite (ambiente local). Adaptável para PostgreSQL/MySQL |

# Popular banco de dados (opcional)| Front-end | HTML5, CSS3 (design responsivo) |

python popular_dados.py| Dependências essenciais | Pillow (imagens), python-dotenv (carregamento do `.env`) |



# Iniciar servidorEstrutura de diretórios principal:

python manage.py runserver

``````

queops/

Acesse: `http://127.0.0.1:8000/`├── core/               # Landing page e conteúdo institucional

├── produtos/           # Regras de catálogo e exibição

## Configuração├── usuarios/           # Autenticação, perfis, social login

├── pedidos/            # Carrinho, checkout, frete, pagamentos

Crie um arquivo `.env` na raiz com as credenciais necessárias:├── templates/          # Templates HTML compartilhados

├── static/             # CSS, imagens e assets estáticos

```env├── media/              # Uploads gerenciados pelo admin

GOOGLE_CLIENT_ID=your_client_id└── queops/             # Configurações de projeto e URLs globais

GOOGLE_CLIENT_SECRET=your_client_secret```

SECRET_KEY=your_django_secret_key

DEBUG=True---

```

## Preparação do Ambiente

### OAuth Google

```bash

Para habilitar login social:git clone <url-do-repositorio>

cd e-commerce

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)

2. Crie credenciais OAuth 2.0python -m venv venv

3. Configure URI de redirecionamento:./venv/Scripts/activate   # Windows

   - Desenvolvimento: `http://localhost:8000/usuarios/login/google/callback/`# source venv/bin/activate  # Linux/macOS

   - Produção: adicione seu domínio oficial

pip install django pillow python-dotenv

## Funcionalidades Implementadas```



**Pagamentos**---

- Sistema de gateway simulado

- Suporte a múltiplos métodos (cartão, PIX, boleto)## Execução Local

- Registro completo de transações

```bash

**Frete**# Aplicar migrações

- Cálculo automático por CEPpython manage.py migrate

- Tabela regionalizada de preços

- Validação de endereço# (opcional) Popular base de dados de exemplo

python popular_dados.py

**Autenticação**

- Login tradicional (email/senha)# Subir servidor de desenvolvimento

- Integração OAuth com Googlepython manage.py runserver

- Sistema de recuperação de senha```



## Contas de TesteA aplicação ficará disponível em `http://127.0.0.1:8000/`.



Após executar `popular_dados.py`:---



| Tipo          | Usuário   | Senha      | Acesso        |## Variáveis de Ambiente

|---------------|-----------|------------|---------------|

| Administrador | admin     | admin123   | /admin/       |Crie um arquivo `.env` na raiz do projeto com os seguintes valores (exemplo):

| Cliente       | cliente   | cliente123 | Área do usuário |

```

## Principais RotasGOOGLE_CLIENT_ID=seu_client_id

GOOGLE_CLIENT_SECRET=sua_chave

``````

/                           - Homepage

/produtos/                  - CatálogoAs variáveis são carregadas automaticamente durante a inicialização. Para produção, recomenda-se configurar esses valores diretamente no ambiente de execução.

/produtos/<slug>/           - Detalhes do produto

/pedidos/carrinho/          - Carrinho### Configuração do Google OAuth

/pedidos/checkout/          - Finalização

/usuarios/registro/         - Cadastro1. Crie credenciais OAuth 2.0 do tipo “Aplicativo Web” no [Google Cloud Console](https://console.cloud.google.com/).

/usuarios/login/            - Login2. Autorização para desenvolvimento:

/usuarios/perfil/           - Área do cliente	- **URI de redirecionamento:** `http://localhost:8000/usuarios/login/google/callback/`

/admin/                     - Painel admin	- **Origem JavaScript (opcional):** `http://localhost:8000`

```3. Em produção, adicione os domínios definitivos nas listas de origens e redirecionamentos.



## Próximas Implementações---



- Sistema de notificações por email## Pagamentos e Frete

- Avaliações e comentários de produtos

- Cupons de desconto- **Frete por CEP:** cálculo escalonado por região com feedback imediato ao usuário.

- Dashboard de analytics para admin- **Pagamentos simulados:** gateway fictício que representa Cartão de Crédito, Pix e Boleto, registrando status e códigos de autorização para cada pedido.

- API REST

- Testes automatizadosAs regras do pagamento estão encapsuladas em `pedidos/services.py`, mantendo o domínio pronto para integração real no futuro.



## Licença---



Projeto desenvolvido para fins educacionais.## Contas de Acesso de Demonstração



---Disponíveis após executar `popular_dados.py`:



**Farmácia QUEOPS** - Cuidando da sua saúde| Perfil | Usuário | Senha | Observações |

| --- | --- | --- | --- |
| Administrador | `admin` | `admin123` | Acesso ao Django Admin (`/admin/`) |
| Cliente | `cliente` | `cliente123` | Perfil de compras para testes |

---

## Mapa de Rotas

| Endpoint | Descrição |
| --- | --- |
| `/` | Página inicial |
| `/produtos/` | Catálogo completo |
| `/produtos/<slug>/` | Detalhes do produto |
| `/pedidos/carrinho/` | Carrinho de compras |
| `/pedidos/checkout/` | Processo de checkout |
| `/usuarios/registro/` | Cadastro de clientes |
| `/usuarios/login/` | Login tradicional |
| `/usuarios/login/google/` | Início do fluxo Google |
| `/usuarios/perfil/` | Histórico de pedidos |
| `/admin/` | Painel administrativo |

---

## Roadmap

- [x] Integração de pagamento e registro de transações
- [x] Wishlist para clientes autenticados
- [x] Cálculo de frete por CEP
- [x] Login social (Google OAuth)
- [ ] Envio de e-mails transacionais
- [ ] Sistema de avaliações de produtos
- [ ] Cupons e promoções avançadas
- [ ] Dashboard analítico para administradores
- [ ] API REST para integrações externas
- [ ] Cobertura de testes automatizados

---

## Créditos

Projeto desenvolvido para fins educacionais dentro da iniciativa Farmácia QUEOPS.

---

**Farmácia QUEOPS – sua saúde em primeiro lugar.**
- [ ] Envio de e-mails transacionais
