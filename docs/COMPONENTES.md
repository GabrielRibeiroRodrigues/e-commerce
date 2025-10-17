# 📚 Guia de Componentes e Recursos - QUEOPS E-commerce

## 🎨 Sistema de Design

### Cores
```css
/* Brand Colors (Verde Farmácia) */
brand-50: #f0f7f3
brand-100: #d4e9df
brand-500: #1d7a4d (Principal)
brand-600: #17633f
brand-700: #0f4d32

/* Trust Colors (Azul Confiança) */
trust-500: #3b82f6
trust-600: #2563eb

/* Typography */
Font Display: Poppins (headings)
Font Body: Inter (corpo do texto)
```

---

## 🔔 Toast Notifications

Sistema de notificações com Alpine.js e animações suaves.

### Uso Básico

```javascript
// Success
window.toast.success('Título', 'Mensagem opcional', 5000);

// Error
window.toast.error('Erro!', 'Descrição do erro');

// Warning
window.toast.warning('Atenção', 'Mensagem de aviso');

// Info
window.toast.info('Informação', 'Descrição');
```

### Exemplo em Formulários

```html
<form onsubmit="handleSubmit(event)">
    <!-- campos -->
</form>

<script>
function handleSubmit(event) {
    event.preventDefault();
    window.toast.success('Sucesso!', 'Formulário enviado');
    // continuar com submit
}
</script>
```

---

## 💀 Skeleton Loaders

Componentes de loading para melhor UX durante carregamentos.

### API JavaScript

```javascript
// Mostrar skeleton
window.skeletonLoader.show('content-id', 'skeleton-id');

// Esconder skeleton
window.skeletonLoader.hide('content-id', 'skeleton-id');

// Wrapper para requisições
await window.skeletonLoader.wrap('products', 'skeleton-products', async () => {
    const response = await fetch('/api/products');
    return response.json();
});
```

### Componentes Disponíveis

- `#skeleton-product-grid` - Grid de produtos
- `#skeleton-product-detail` - Página de detalhe
- `#skeleton-cart-item` - Item do carrinho (template)
- `#skeleton-table-row` - Linha de tabela (template)

### Uso em HTML

```html
<!-- Conteúdo real -->
<div id="products-content">
    <!-- produtos aqui -->
</div>

<!-- Skeleton loader -->
<div id="skeleton-products" class="hidden">
    {% include 'includes/skeleton_loaders.html' %}
</div>
```

---

## 🔘 Button Loading States

Estados de loading para botões durante ações assíncronas.

### API JavaScript

```javascript
const button = document.querySelector('#my-button');

// Iniciar loading
window.buttonLoader.start(button, 'Processando...');

// Parar loading
window.buttonLoader.stop(button);

// Wrapper para ações
await window.buttonLoader.wrap(button, async () => {
    await fetch('/api/action');
}, 'Salvando...');
```

### Com Alpine.js

```html
<button 
    x-data="{ loading: false }"
    @click="loading = true; await action(); loading = false"
    :disabled="loading"
>
    <svg x-show="loading" class="animate-spin">...</svg>
    <span x-text="loading ? 'Carregando...' : 'Enviar'"></span>
</button>
```

---

## ⭐ Sistema de Reviews

Exibição de avaliações com estrelas nos cards e páginas de produtos.

### No Card de Produto

```django
{% if produto.total_avaliacoes > 0 %}
<div class="flex items-center gap-2">
    <div class="flex gap-0.5">
        {% for i in "12345" %}
            {% if forloop.counter <= produto.media_avaliacoes %}
                <svg><!-- estrela preenchida --></svg>
            {% else %}
                <svg><!-- estrela vazia --></svg>
            {% endif %}
        {% endfor %}
    </div>
    <span>{{ produto.media_avaliacoes|floatformat:1 }} ({{ produto.total_avaliacoes }})</span>
</div>
{% endif %}
```

---

## 🛡️ Trust Signals

Badges de confiança para aumentar conversão no checkout.

### Incluídos no Checkout

- **Compra 100% Segura** - SSL encryption
- **Dados Protegidos** - Conformidade LGPD
- **Farmácia Licenciada** - CRF/SP 100470
- **Entrega Garantida** - Ou dinheiro de volta

### Social Proof

```html
<div class="p-4 bg-brand-50 rounded-xl">
    <div class="flex items-center gap-2">
        <div class="flex -space-x-2">
            <!-- avatares -->
        </div>
        <p class="counter" data-target="127">0</p> pessoas
    </div>
    <p>compraram nas últimas 24 horas</p>
</div>
```

---

## ♿ Acessibilidade (WCAG 2.1 Level AA)

### Skip Links

```html
<a href="#main-content" class="sr-only focus:not-sr-only">
    Pular para o conteúdo principal
</a>
```

### ARIA Labels

```html
<!-- Botões com apenas ícones -->
<button aria-label="Abrir menu" aria-expanded="false">
    <svg aria-hidden="true">...</svg>
</button>

<!-- Links com badges -->
<a href="/cart" aria-label="Carrinho de compras (3 itens)">
    <svg aria-hidden="true">...</svg>
    <span aria-hidden="true">3</span>
</a>
```

### Keyboard Navigation

- **Esc** - Fecha modais e dropdowns
- **Tab** - Navega entre elementos interativos
- **Enter/Space** - Ativa botões e links

---

## 🍞 Breadcrumb com Schema.org

Navegação estruturada com markup SEO.

### Uso

```django
<!-- Em produtos/detalhe.html -->
{% include 'includes/breadcrumb.html' with breadcrumb_items=items %}
```

### Definir Items

```python
# views.py
breadcrumb_items = [
    {'title': 'Produtos', 'url': reverse('produtos:lista')},
    {'title': categoria.nome, 'url': reverse('produtos:lista') + f'?categoria={categoria.slug}'},
    {'title': produto.nome, 'url': ''}  # último item sem URL
]
```

---

## 🎬 Animações e Micro-interações

### Classes Disponíveis

```html
<!-- Fade In Up (AOS) -->
<div data-aos="fade-up" data-aos-delay="100">...</div>

<!-- Bounce Attention -->
<div class="bounce-animate">...</div>

<!-- Shake on Error -->
<div class="shake-error">...</div>

<!-- Icon Wiggle -->
<button class="icon-wiggle">...</button>

<!-- Heart Beat -->
<svg class="heart-beat">...</svg>

<!-- Glow Effect -->
<div class="glow-effect">...</div>

<!-- Button Ripple -->
<button class="btn-ripple">Clique</button>
```

### Contadores Animados

```html
<span class="counter" data-target="1500">0</span>
```

---

## 📱 Melhorias Mobile

### Touch Targets

Todos os botões/links têm mínimo de 44x44px (iOS) / 48x48px (Android).

### Gestures

- **Swipe** em carrosséis de produtos
- **Pull to refresh** em listas (se implementado)
- **Pinch to zoom** em imagens de produtos

---

## 🎨 CSS Utilities

### Custom Classes

```css
/* Skeleton Shimmer */
.skeleton-shimmer-enhanced

/* Gradient Animation */
.gradient-animate

/* Stagger Animation */
.stagger-item:nth-child(1-6)

/* Focus Visible */
*:focus-visible { outline: 2px solid #1d7a4d; }
```

---

## 🚀 Performance

### Otimizações Implementadas

1. **Lazy Loading** - Imagens carregam sob demanda
2. **Skeleton Loaders** - Percepção de velocidade
3. **Preload Class** - Evita animações em page load
4. **Reduced Motion** - Respeita preferências do usuário
5. **Smooth Scroll** - Navegação suave com `scroll-behavior`

---

## 🧪 Testes Recomendados

### Acessibilidade

```bash
# Lighthouse CI
lighthouse https://seusite.com --view

# axe DevTools (extensão navegador)
# NVDA / JAWS (leitores de tela)
```

### Performance

```bash
# PageSpeed Insights
# GTmetrix
# WebPageTest
```

---

## 📝 Checklist de Implementação

- [x] Toast Notifications
- [x] Skeleton Loaders
- [x] Button Loading States
- [x] Reviews System
- [x] Trust Signals
- [x] Breadcrumb SEO
- [x] ARIA Labels
- [x] Skip Links
- [x] Keyboard Navigation
- [x] Animações CSS
- [x] Reduced Motion Support
- [ ] Image Lazy Loading (implementar)
- [ ] Service Worker (PWA)
- [ ] Analytics Integration

---

## 🤝 Contribuindo

1. Sempre adicionar ARIA labels em novos componentes
2. Testar com keyboard-only navigation
3. Verificar contraste de cores (WCAG AA: 4.5:1)
4. Adicionar animações com `prefers-reduced-motion`
5. Documentar novos componentes aqui

---

## 📞 Suporte

Para dúvidas sobre implementação, consulte:
- Documentação Alpine.js: https://alpinejs.dev
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Tailwind CSS: https://tailwindcss.com/docs

---

**Versão:** 2.0  
**Última Atualização:** Outubro 2025  
**Mantido por:** Equipe QUEOPS Dev
