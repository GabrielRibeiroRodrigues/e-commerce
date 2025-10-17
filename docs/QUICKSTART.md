# ⚡ Quick Start - Componentes QUEOPS

## 🎯 Uso Mais Comum

### 1. Mostrar Notificação de Sucesso

```javascript
window.toast.success('Produto adicionado!', 'Item adicionado ao carrinho');
```

### 2. Adicionar Loading em Botão

```html
<button 
    x-data="{ loading: false }"
    @click="loading = true; await minhaFuncao(); loading = false"
    :disabled="loading"
>
    <svg x-show="loading" class="animate-spin w-5 h-5">...</svg>
    <span x-text="loading ? 'Processando...' : 'Enviar'"></span>
</button>
```

### 3. Skeleton para Lista de Produtos

```javascript
// Mostrar skeleton
window.skeletonLoader.show('products-list', 'skeleton-product-grid');

// Carregar dados
const products = await fetch('/api/products').then(r => r.json());

// Esconder skeleton
window.skeletonLoader.hide('products-list', 'skeleton-product-grid');
```

### 4. Adicionar Estrelas de Review

```django
{% if produto.total_avaliacoes > 0 %}
<div class="flex items-center gap-2">
    <div class="flex gap-0.5">
        {% for i in "12345" %}
            <svg class="w-4 h-4" fill="{% if forloop.counter <= produto.media_avaliacoes %}#FFC107{% else %}#E5E7EB{% endif %}">
                <path d="M8 1l2 4 4 .5-3 3 .5 4-3.5-2-3.5 2 .5-4-3-3 4-.5 2-4z"/>
            </svg>
        {% endfor %}
    </div>
    <span class="text-sm">{{ produto.media_avaliacoes|floatformat:1 }} ({{ produto.total_avaliacoes }})</span>
</div>
{% endif %}
```

### 5. Breadcrumb SEO

```django
<!-- Definir items na view -->
breadcrumb_items = [
    {'title': 'Produtos', 'url': reverse('produtos:lista')},
    {'title': produto.nome, 'url': ''}
]

<!-- No template -->
{% include 'includes/breadcrumb.html' with breadcrumb_items=breadcrumb_items %}
```

### 6. ARIA Labels para Ícones

```html
<!-- Botão só com ícone -->
<button aria-label="Adicionar aos favoritos">
    <svg aria-hidden="true">❤️</svg>
</button>

<!-- Link com badge -->
<a href="/cart" aria-label="Carrinho (3 itens)">
    <svg aria-hidden="true">🛒</svg>
    <span aria-hidden="true" class="badge">3</span>
</a>
```

## 🎨 Animações Rápidas

```html
<!-- Fade up on scroll (AOS) -->
<div data-aos="fade-up">Conteúdo</div>

<!-- Bounce ao aparecer -->
<div class="bounce-animate">Atenção!</div>

<!-- Shake em erro -->
<div class="shake-error">Campo inválido</div>

<!-- Icon wiggle no hover -->
<button class="icon-wiggle">
    <svg>🔔</svg>
</button>
```

## 🚨 Feedback Visual

```javascript
// Sucesso
window.toast.success('✅ Feito!', 'Ação concluída');

// Erro
window.toast.error('❌ Ops!', 'Algo deu errado');

// Aviso
window.toast.warning('⚠️ Atenção', 'Verifique os dados');

// Info
window.toast.info('ℹ️ Dica', 'Você sabia que...');
```

## 📋 Checklist para Nova Funcionalidade

- [ ] Adicionar toast de confirmação
- [ ] Implementar loading state nos botões
- [ ] Adicionar ARIA labels em ícones
- [ ] Testar navegação por teclado (Tab, Enter, Esc)
- [ ] Verificar responsividade mobile
- [ ] Adicionar skeleton loader se houver delay
- [ ] Animar entrada de elementos (fade-up)
- [ ] Testar com leitor de tela

## 🆘 Troubleshooting

### Toast não aparece?
```javascript
// Verificar se toastManager está no body
<body x-data="toastManager()">

// Disparar evento correto
window.dispatchEvent(new CustomEvent('toast', { detail: {...} }));
```

### Skeleton não esconde?
```javascript
// Verificar IDs corretos
window.skeletonLoader.hide('content-id', 'skeleton-id');
```

### Animações não funcionam?
```html
<!-- Importar CSS de animações -->
<link rel="stylesheet" href="{% static 'css/animations.css' %}">

<!-- Remover classe preload no body -->
<body class="preload">
```

## 🔗 Links Úteis

- [Documentação Completa](./COMPONENTES.md)
- [Alpine.js Docs](https://alpinejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Dúvidas?** Consulte [COMPONENTES.md](./COMPONENTES.md) para documentação detalhada.
