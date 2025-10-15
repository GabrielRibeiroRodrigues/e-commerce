# 🚀 Guia Rápido de Uso - Farmácia QUEOPS

## ⚡ Início Rápido

### 1. Inicie o servidor
```bash
python manage.py runserver
```

### 2. Acesse no navegador
```
http://127.0.0.1:8000/
```

## 🎯 Principais Recursos

### 👤 Como Cliente

1. **Navegar Produtos**
   - Acesse a página inicial
   - Clique em "Produtos" no menu
   - Use a busca ou filtros por categoria
   - Ordene por preço, nome ou data

2. **Comprar Produtos**
   - Clique em um produto para ver detalhes
   - Selecione a quantidade
   - Clique em "Adicionar ao Carrinho"
   - Acesse o carrinho (ícone 🛒 no topo)

3. **Finalizar Compra**
   - No carrinho, clique em "Finalizar Compra"
   - Faça login ou crie uma conta
   - Preencha os dados de entrega
   - Confirme o pedido

4. **Acompanhar Pedidos**
   - Faça login
   - Acesse "Meu Perfil"
   - Veja o histórico de pedidos

### 🔧 Como Administrador

1. **Acessar Painel Admin**
   ```
   http://127.0.0.1:8000/admin/
   ```
   - Login: admin
   - Senha: admin123

2. **Gerenciar Produtos**
   - Vá em "Produtos" → "Produtos"
   - Clique em "Adicionar Produto"
   - Preencha os dados
   - Faça upload de imagem
   - Salve

3. **Gerenciar Categorias**
   - Vá em "Produtos" → "Categorias"
   - Adicione novas categorias
   - O slug é gerado automaticamente

4. **Gerenciar Pedidos**
   - Vá em "Pedidos" → "Pedidos"
   - Veja todos os pedidos
   - Altere status (pendente, processando, enviado, entregue)
   - Veja itens de cada pedido

5. **Editar Produtos em Massa**
   - Na lista de produtos
   - Marque os produtos desejados
   - Use os campos editáveis inline
   - Salve as alterações

## 💡 Dicas

### Para Testes
- Use o usuário **cliente** (senha: cliente123) para testar como comprador
- Use o usuário **admin** (senha: admin123) para gerenciar o sistema

### Produtos em Destaque
- Marque "Destaque" no admin para aparecer na home
- Adicione preço promocional para mostrar desconto

### Controle de Estoque
- O estoque é atualizado automaticamente após cada compra
- Produtos com estoque zero não podem ser comprados
- Alerta quando o estoque é menor que 10 unidades

### Categorias
- Organize produtos por categorias
- Use nomes claros e descritivos
- O slug é usado nas URLs

## 🛠️ Comandos Úteis

### Criar superusuário manualmente
```bash
python manage.py createsuperuser
```

### Limpar banco e repopular
```bash
# Deletar db.sqlite3
del db.sqlite3  # Windows
rm db.sqlite3   # Linux/Mac

# Recriar banco
python manage.py migrate
python popular_dados.py
```

### Coletar arquivos estáticos (produção)
```bash
python manage.py collectstatic
```

### Ver todas as rotas
```bash
python manage.py show_urls
```

## 📊 Estrutura de URLs

| URL | Descrição |
|-----|-----------|
| `/` | Página inicial |
| `/produtos/` | Lista de produtos |
| `/produtos/<slug>/` | Detalhes do produto |
| `/pedidos/carrinho/` | Carrinho de compras |
| `/pedidos/checkout/` | Finalizar compra |
| `/usuarios/registro/` | Cadastro |
| `/usuarios/login/` | Login |
| `/usuarios/logout/` | Logout |
| `/usuarios/perfil/` | Perfil do usuário |
| `/admin/` | Painel administrativo |

## 🎨 Personalizações

### Alterar Cores
Edite o arquivo `static/css/style.css` e modifique as variáveis CSS:
```css
:root {
    --verde-principal: #2d8659;
    --verde-escuro: #1f5d3d;
    --verde-claro: #4ba876;
}
```

### Adicionar Logo
Substitua o emoji 🏥 no arquivo `templates/base.html` por uma tag `<img>`:
```html
<a href="{% url 'core:home' %}" class="logo">
    <img src="{% static 'img/logo.png' %}" alt="QUEOPS">
</a>
```

### Mudar Título do Site
Edite `templates/base.html`:
```html
<title>{% block title %}Seu Título{% endblock %}</title>
```

## ⚠️ Solução de Problemas

### Erro: No module named 'PIL'
```bash
pip install pillow
```

### Erro: static files not found
```bash
python manage.py collectstatic
```

### Erro: CSRF verification failed
- Verifique se `{% csrf_token %}` está nos formulários
- Limpe cookies do navegador

### Servidor não inicia
- Verifique se a porta 8000 está disponível
- Use porta alternativa: `python manage.py runserver 8080`

## 🔒 Segurança

⚠️ **IMPORTANTE para Produção:**

1. Mude `DEBUG = False` em `settings.py`
2. Configure `ALLOWED_HOSTS` adequadamente
3. Use variáveis de ambiente para `SECRET_KEY`
4. Configure um banco de dados robusto (PostgreSQL)
5. Use HTTPS
6. Configure backup automático

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte o README.md principal
2. Verifique a documentação do Django
3. Revise os logs de erro no terminal

---

**Boa sorte com sua Farmácia QUEOPS! 🏥💚**
