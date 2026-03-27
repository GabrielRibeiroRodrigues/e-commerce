# Redesign — Farmácia QUEOPS

> Documento de diagnóstico e plano de modernização visual do frontend Next.js.
> Criado em: 2026-03-27

---

## Diagnóstico Geral

**Nível atual: FUNCIONAL MAS BÁSICO (4/10 de polish)**

- ✅ Responsivo — funciona em mobile/tablet/desktop
- ✅ Usável — navegação clara, fluxos lógicos
- ✅ Acessível — HTML semântico, labels nos formulários
- ❌ Polido — sem refinamento visual, sem micro-interações
- ❌ Com identidade de marca — design genérico azul-cinza
- ❌ Moderno — sem sistema de design, sem animações
- ❌ Agradável — nenhum detalhe visual que surpreenda

---

## Diagnóstico por Página/Componente

### Header (`components/layout/Header.tsx`)
- Sem menu mobile (hamburger/drawer)
- Sem barra de busca integrada
- Apenas texto como logo — sem ícone/símbolo
- Sem ícone para wishlist
- Sem ícone colorido no carrinho ao passar o mouse
- Nav sem ícones — só texto

### Footer (`components/layout/Footer.tsx`)
- Praticamente vazio — só copyright e CNPJ fictício
- Sem links úteis (sobre, contato, políticas)
- Sem redes sociais
- Sem selos de segurança (SSL, LGPD, formas de pagamento)
- Sem newsletter

### ProdutoCard (`components/produto/ProdutoCard.tsx`)
- Badge de promoção sem percentual de desconto
- Sem ícone de coração (wishlist)
- Sem indicador de estoque baixo
- Sombra e hover discretos demais
- Sem skeleton loading
- Imagem placeholder grande e cinza — parece vazio

### Home (`app/page.tsx`)
- Hero só com gradiente + texto — sem imagem, sem ilustração
- Sem seção de categorias com ícones
- Sem trust signals (entrega rápida, segurança, qualidade)
- Sem banner de promoção
- Sem CTA secundário

### Produto Detalhe (`app/produtos/[slug]/page.tsx`)
- Sem galeria de imagens (só uma imagem)
- Separador de breadcrumb é barra "/" em texto puro
- Sem badges informativos (Destaque, Novo, Promoção)
- Sem informação de entrega estimada
- Formulário de avaliação misturado com conteúdo
- Avaliações sem barra de distribuição (5★ X%, 4★ Y%...)
- Sem seção de produtos relacionados
- Botões sem profundidade/sombra

### Catálogo (`app/produtos/page.tsx`)
- Sidebar sem filtro de faixa de preço
- Filtros ativos sem chips removíveis
- Sem toggle grid/lista
- Sem skeleton loading
- Contador de produtos em texto cinza simples

### Login / Registro (`app/login/page.tsx`, `app/registro/page.tsx`)
- Sem identidade visual da marca no formulário
- Sem ícone para mostrar/ocultar senha
- Sem indicador de força de senha (registro)
- Sem feedback visual de validação em tempo real
- Sem "Esqueceu a senha?"
- Card flutuante sem contexto ou boas-vindas
- Layout ocupa só centro — espaço desperdiçado em desktop

### Carrinho (`app/carrinho/page.tsx`)
- Layout congestionado — imagens pequenas
- Botão "OK" do CEP em cinza sem destaque
- Sem campo de cupom de desconto (UI)
- Sem sugestão de produtos complementares
- Summary sem destaque visual

### Checkout (`app/checkout/page.tsx`)
- Sem indicador de etapas (Endereço → Pagamento → Confirmação)
- Métodos de pagamento com emoji em vez de ícones reais
- Sem busca automática de endereço por CEP
- Sem ícones de bandeiras de cartão
- Validação só no servidor — sem feedback em tempo real
- Resumo do pedido sem imagens

### Pedidos (`app/pedidos/page.tsx`)
- Cards pesados em texto, sem ícones por status
- Sem timeline visual de progresso
- Hover com sombra fraca — não parece clicável o suficiente
- Empty state em texto puro

### Pedido Detalhe (`app/pedidos/[id]/page.tsx`)
- Status com emoji (✅⏳❌) — parece amador
- Sem timeline de entrega
- Código de confirmação não é copiável
- Sem botão de imprimir/download
- "← Meus Pedidos" sem estilo de botão

### Perfil (`app/perfil/page.tsx`)
- Sem avatar/foto de perfil
- Sem tabs (Dados / Pedidos / Desejos / Segurança)
- Sem opção de alterar senha
- Campo desabilitado (username) parece quebrado visualmente
- Sem data de cadastro destacada

### Wishlist (`app/desejos/page.tsx`)
- Botão de remover (X) com affordance baixa
- Empty state só texto — sem ilustração ou CTA

### Componentes UI
- `Estrelas`: estrelas pequenas (w-4), sem nota numérica ao lado
- `LoadingSpinner`: spinner genérico sem texto de suporte
- `OrdenarSelect`: usa `<select>` nativo do browser — sem estilo customizado

---

## Problemas Globais

| Categoria | Problema |
|-----------|----------|
| Ícones | Quase nenhum — UI completamente baseada em texto |
| Animações | Só hover com sombra e scale na imagem |
| Feedback | Sem toasts/notificações flutuantes |
| Skeletons | Sem loading states visuais |
| Empty states | Só texto simples, sem ilustração ou CTA |
| Breadcrumbs | Só na página de detalhe, em formato básico |
| Design tokens | Sem `tailwind.config.ts` customizado |
| Cores | Paleta segura mas genérica — só azul e cinza |
| Tipografia | Geist padrão, sem hierarquia tipográfica definida |
| Mobile | Responsivo mas sem menu mobile funcional |

---

## Paleta Atual (Problemas)

| Cor | Uso Atual | Problema |
|-----|-----------|----------|
| `blue-600` | Botões, links, acentos | Funciona mas é genérico |
| `gray-50/200` | Fundos, bordas | Excesso de cinza — visual apagado |
| `red-500` | Promoções, erros, deletar | Cores com função dupla — confuso |
| `yellow-400` | Estrelas | OK mas pode colidir com backgrounds |
| `green-500` | Sucesso | Um pouco vibrante demais |
| `white` | Cards, fundo | Usado em excesso |

---

## Plano de Implementação

### Fase A — Fundação visual
- [ ] Instalar `lucide-react`
- [ ] Criar `tailwind.config.ts` com cores, tipografia e animações da marca
- [ ] Refatorar `globals.css` com CSS variables e classes utilitárias

### Fase B — Layout global
- [ ] Header: busca integrada, menu mobile (drawer), ícones, wishlist
- [ ] Footer: 4 colunas com links, contato, selos de segurança, redes sociais

### Fase C — Componentes reutilizáveis
- [ ] `Breadcrumb`
- [ ] `EmptyState` (com ilustração + CTA)
- [ ] `SkeletonCard` (loading animado)
- [ ] `Toast` / notificação flutuante
- [ ] `Badge` unificado
- [ ] `StepIndicator` (para checkout)
- [ ] `ProdutoCard` redesenhado (wishlist, % desconto, skeleton)

### Fase D — Páginas (ordem por impacto)
- [ ] D1. Home — hero com imagem, categorias com ícones, trust signals
- [ ] D2. Produto Detalhe — galeria, badges, produtos relacionados
- [ ] D3. Catálogo — filtros com chips, skeleton, range de preço
- [ ] D4. Carrinho — layout espaçoso, cupom UI, summary destacado
- [ ] D5. Checkout — step indicator, ícones de pagamento, validação visual
- [ ] D6. Login/Registro — layout split, validação em tempo real
- [ ] D7. Pedidos — timeline visual, ícones de status
- [ ] D8. Perfil/Desejos — avatar, tabs, empty states

### Fase E — Polish final
- [ ] Animações de entrada nas páginas (fade-up)
- [ ] Toasts em todas as ações do usuário
- [ ] Revisão de espaçamento mobile-first
- [ ] Favicon e meta tags da farmácia
- [ ] Auditoria de acessibilidade final

---

## Decisões Pendentes (confirmar com usuário)

1. **Cor principal**: manter azul atual ou verde farmácia?
2. **Biblioteca de ícones**: `lucide-react` (recomendado) ou outra?
3. **Ritmo de implementação**: fase por fase com revisão ou tudo de uma vez?
