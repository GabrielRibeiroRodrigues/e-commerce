# 🏥 Farmácia QUEOPS - E-commerce

E-commerce completo desenvolvido em Django para a **Farmácia QUEOPS**, com sistema de gerenciamento de produtos, carrinho de compras, checkout e autenticação de usuários.

## 🚀 Tecnologias Utilizadas

- **Backend:** Django 5.2.7
- **Frontend:** HTML5, CSS3 (puro)
- **Banco de Dados:** SQLite
- **Bibliotecas:** Pillow (para gerenciamento de imagens)

## ✨ Funcionalidades

# Farmácia QUEOPS – Plataforma de E-commerce

Aplicação web completa construída com Django para a Farmácia QUEOPS. O projeto cobre o fluxo de venda ponta a ponta: catálogo de produtos, carrinho, checkout com cálculo de frete, pagamento integrado e experiência autenticada para clientes e administradores.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Arquitetura e Tecnologia](#arquitetura-e-tecnologia)
- [Preparação do Ambiente](#preparação-do-ambiente)
- [Execução Local](#execução-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Pagamentos e Frete](#pagamentos-e-frete)
- [Contas de Acesso de Demonstração](#contas-de-acesso-de-demonstracao)
- [Mapa de Rotas](#mapa-de-rotas)
- [Roadmap](#roadmap)
- [Créditos](#créditos)

---

## Visão Geral

A solução foi desenhada para uma farmácia de médio porte que deseja vender on-line sem dependências de frameworks front-end pesados. A interface utiliza HTML e CSS puros, com foco em clareza e acessibilidade, enquanto o back-end Django garante segurança, escalabilidade e manutenção facilitada.

---

## Principais Funcionalidades

### Experiência do Cliente
- Catálogo com filtros, busca e sinalização de promoções.
- Página de detalhes com informações completas do produto e integração com wishlist.
- Carrinho com atualização de quantidades e feedback imediato.
- Checkout com validação de endereço, cálculo de frete por CEP e captura de pagamento.
- Histórico de pedidos e acompanhamento pós-compra em área autenticada.
- Autenticação tradicional e login social via Google OAuth 2.0.

### Operações e Backoffice
- Painel administrativo customizado (Django Admin) com visão dos pedidos e itens.
- Controle automático de estoque e status do pedido.
- Gestão de catálogo (categorias, promoções, destaques, imagens de produto).
- Registro das transações financeiras associadas a cada pedido.

---

## Arquitetura e Tecnologia

| Camada | Tecnologias |
| --- | --- |
| Back-end | Python 3.12, Django 5.2.7 |
| Banco de dados | SQLite (ambiente local). Adaptável para PostgreSQL/MySQL |
| Front-end | HTML5, CSS3 (design responsivo) |
| Dependências essenciais | Pillow (imagens), python-dotenv (carregamento do `.env`) |

Estrutura de diretórios principal:

```
queops/
├── core/               # Landing page e conteúdo institucional
├── produtos/           # Regras de catálogo e exibição
├── usuarios/           # Autenticação, perfis, social login
├── pedidos/            # Carrinho, checkout, frete, pagamentos
├── templates/          # Templates HTML compartilhados
├── static/             # CSS, imagens e assets estáticos
├── media/              # Uploads gerenciados pelo admin
└── queops/             # Configurações de projeto e URLs globais
```

---

## Preparação do Ambiente

```bash
git clone <url-do-repositorio>
cd e-commerce

python -m venv venv
./venv/Scripts/activate   # Windows
# source venv/bin/activate  # Linux/macOS

pip install django pillow python-dotenv
```

---

## Execução Local

```bash
# Aplicar migrações
python manage.py migrate

# (opcional) Popular base de dados de exemplo
python popular_dados.py

# Subir servidor de desenvolvimento
python manage.py runserver
```

A aplicação ficará disponível em `http://127.0.0.1:8000/`.

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com os seguintes valores (exemplo):

```
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=sua_chave
```

As variáveis são carregadas automaticamente durante a inicialização. Para produção, recomenda-se configurar esses valores diretamente no ambiente de execução.

### Configuração do Google OAuth

1. Crie credenciais OAuth 2.0 do tipo “Aplicativo Web” no [Google Cloud Console](https://console.cloud.google.com/).
2. Autorização para desenvolvimento:
	- **URI de redirecionamento:** `http://localhost:8000/usuarios/login/google/callback/`
	- **Origem JavaScript (opcional):** `http://localhost:8000`
3. Em produção, adicione os domínios definitivos nas listas de origens e redirecionamentos.

---

## Pagamentos e Frete

- **Frete por CEP:** cálculo escalonado por região com feedback imediato ao usuário.
- **Pagamentos simulados:** gateway fictício que representa Cartão de Crédito, Pix e Boleto, registrando status e códigos de autorização para cada pedido.

As regras do pagamento estão encapsuladas em `pedidos/services.py`, mantendo o domínio pronto para integração real no futuro.

---

## Contas de Acesso de Demonstração

Disponíveis após executar `popular_dados.py`:

| Perfil | Usuário | Senha | Observações |
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
