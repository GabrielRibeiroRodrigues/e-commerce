# 📊 Dashboards Administrativos - Farmácia QUEOPS

## Acesso aos Dashboards

Os dashboards administrativos estão disponíveis de duas formas:

### 1️⃣ Através do Painel Admin do Django

Acesse: `http://127.0.0.1:8000/admin/`

Na página inicial do admin, você verá uma seção **"Dashboards & Relatórios"** com 6 atalhos rápidos:

- **Dashboard Principal** - Visão geral com métricas
- **Relatório de Vendas** - Análise detalhada de vendas
- **Relatório de Estoque** - Controle de inventário
- **Relatório de Usuários** - Análise de clientes
- **Solicitações LGPD** - Gerenciar solicitações de dados
- **Exportar Dados** - Exportar relatórios em CSV

### 2️⃣ Acesso Direto via URLs

Você também pode acessar diretamente pelas URLs:

```
http://127.0.0.1:8000/admin-dashboard/
http://127.0.0.1:8000/admin-relatorios/vendas/
http://127.0.0.1:8000/admin-relatorios/estoque/
http://127.0.0.1:8000/admin-relatorios/usuarios/
http://127.0.0.1:8000/admin-relatorios/exportar-vendas/
http://127.0.0.1:8000/admin-relatorios/exportar-estoque/
```

## 📈 Recursos dos Dashboards

### Dashboard Principal
- **20+ Métricas** em tempo real
- **6 Gráficos interativos** com Chart.js:
  - Vendas dos últimos 30 dias (linha)
  - Pedidos por status (rosca)
  - Top 10 produtos mais vendidos (barras)
  - Categorias mais vendidas
  - Novos usuários por semana
  - Métodos de pagamento
- **Sistema de Alertas** para:
  - Produtos sem estoque
  - Produtos com estoque baixo
  - Pedidos pendentes
  - Solicitações LGPD pendentes

### Relatório de Vendas
- **Filtros avançados**: data início/fim, status
- **Estatísticas**: total vendas, quantidade pedidos, ticket médio
- **Últimos 100 pedidos** em tabela
- **Top 20 produtos** mais vendidos
- **Exportação CSV** com dados filtrados

### Relatório de Estoque
- **Categorização automática**:
  - ✅ Estoque OK (≥ 10 unidades)
  - ⚠️ Estoque Baixo (1-9 unidades)
  - 🚫 Esgotados (0 unidades)
- **Valor total** do inventário
- **Produtos mais vendidos** (últimos 30 dias) para planejamento de reposição
- **Alertas visuais** com cores
- **Exportação CSV**

### Relatório de Usuários
- **Métricas de engajamento**:
  - Total de usuários
  - Usuários ativos/inativos
  - Taxa de retenção
- **Top 20 clientes** por valor gasto
- **Gráfico de crescimento** (novos usuários por mês)
- **Insights** de comportamento

## 🔐 Permissões

**Requisito**: Apenas usuários **staff** podem acessar os dashboards.

Para conceder acesso:

```python
# Via shell Django
python manage.py shell

from usuarios.models import User
user = User.objects.get(username='seu_usuario')
user.is_staff = True
user.save()
```

Ou através do admin: `/admin/usuarios/user/`

## 🎨 Características Técnicas

### Frontend
- **Design responsivo** com CSS Grid
- **Chart.js 4.4.0** para gráficos
- **SVG icons** inline
- **Hover effects** e animações
- **Badges coloridos** para status
- **Cards interativos** com sombras

### Backend
- **Django ORM** com agregações otimizadas
- **select_related** e **prefetch_related** para performance
- **Decorador @staff_member_required** para segurança
- **JSON serialization** para dados de gráficos
- **CSV Writer** para exportações
- **Filtros por data** e status

### Performance
- Queries otimizadas com agregações
- Uso de índices de banco de dados
- Limites em queries (top N, últimos 100)
- Cache preparado para implementação futura

## 📊 Exemplos de Métricas Disponíveis

### Financeiras
- Total em vendas (todos os tempos)
- Vendas do mês atual
- Vendas dos últimos 7 dias
- Ticket médio
- Taxa de conversão

### Operacionais
- Total de pedidos
- Pedidos pendentes/processando
- Produtos ativos
- Produtos com estoque baixo
- Produtos esgotados

### Usuários
- Total de usuários cadastrados
- Novos usuários no mês
- Usuários ativos (últimos 7 dias)
- Taxa de retenção
- Top clientes por gasto

### LGPD
- Solicitações pendentes
- Consentimentos ativos
- Logs de acesso (últimos 30 dias)

## 🔄 Atualizações em Tempo Real

Os dashboards exibem dados em **tempo real** - não há cache implementado ainda. Cada acesso busca os dados atualizados do banco de dados.

## 📝 Exportações

Dois tipos de exportação CSV disponíveis:

1. **Relatório de Vendas** (`exportar-vendas-csv`)
   - Últimos 1000 pedidos
   - Colunas: ID, Data, Cliente, Status, Total, Método Pagamento, Status Pagamento

2. **Relatório de Estoque** (`exportar-estoque-csv`)
   - Todos os produtos ativos
   - Colunas: ID, Nome, Categoria, Estoque, Preço, Valor Total em Estoque

## 🚀 Próximas Melhorias

- [ ] Implementar cache Redis
- [ ] Adicionar mais filtros (período customizado, categorias)
- [ ] Gráficos de comparação mês a mês
- [ ] Previsão de vendas com IA
- [ ] Dashboard mobile-first
- [ ] Notificações em tempo real
- [ ] Exportação PDF
- [ ] Agendamento de relatórios por e-mail

## 🐛 Troubleshooting

### Dashboard não carrega
1. Verifique se você está logado como staff: `user.is_staff == True`
2. Verifique se as migrações estão aplicadas: `python manage.py migrate`
3. Verifique o console do navegador para erros JavaScript

### Gráficos não aparecem
1. Verifique se Chart.js está carregando: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
2. Verifique se há dados no período analisado
3. Abra o console do navegador (F12) e procure por erros

### Erros de permissão
1. Certifique-se de estar acessando com usuário staff
2. Verifique as configurações de LOGIN_URL no settings.py

## 📧 Suporte

Para problemas ou sugestões, entre em contato com a equipe de desenvolvimento.
