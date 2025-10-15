from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Count, Sum, Avg, F, Q, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse
import csv
from produtos.models import Produto, Avaliacao, Categoria
from pedidos.models import Pedido, ItemPedido, Pagamento
from usuarios.models import User
from .models import ConsentimentoLGPD, SolicitacaoDados, LogAcessoDados
import json


@staff_member_required
def dashboard_admin(request):
    """Dashboard principal do administrador com métricas e gráficos."""
    
    # Período de análise
    hoje = timezone.now().date()
    inicio_mes = hoje.replace(day=1)
    trinta_dias_atras = hoje - timedelta(days=30)
    sete_dias_atras = hoje - timedelta(days=7)
    
    # ==================== MÉTRICAS GERAIS ====================
    
    # Vendas
    total_vendas = Pedido.objects.filter(
        status__in=['processando', 'enviado', 'entregue']
    ).aggregate(total=Sum('total'))['total'] or 0
    
    vendas_mes = Pedido.objects.filter(
        criado_em__gte=inicio_mes,
        status__in=['processando', 'enviado', 'entregue']
    ).aggregate(total=Sum('total'))['total'] or 0
    
    vendas_7dias = Pedido.objects.filter(
        criado_em__gte=sete_dias_atras,
        status__in=['processando', 'enviado', 'entregue']
    ).aggregate(total=Sum('total'))['total'] or 0
    
    # Pedidos
    total_pedidos = Pedido.objects.count()
    pedidos_pendentes = Pedido.objects.filter(status='pendente').count()
    pedidos_processando = Pedido.objects.filter(status='processando').count()
    pedidos_mes = Pedido.objects.filter(criado_em__gte=inicio_mes).count()
    
    # Usuários
    total_usuarios = User.objects.count()
    usuarios_mes = User.objects.filter(date_joined__gte=inicio_mes).count()
    usuarios_ativos_7dias = User.objects.filter(
        last_login__gte=sete_dias_atras
    ).count()
    
    # Produtos
    total_produtos = Produto.objects.filter(ativo=True).count()
    produtos_estoque_baixo = Produto.objects.filter(
        ativo=True, estoque__lt=10, estoque__gt=0
    ).count()
    produtos_sem_estoque = Produto.objects.filter(ativo=True, estoque=0).count()
    
    # Avaliações
    total_avaliacoes = Avaliacao.objects.count()
    media_avaliacoes = Avaliacao.objects.aggregate(
        media=Avg('rating')
    )['media'] or 0
    avaliacoes_mes = Avaliacao.objects.filter(criado_em__gte=inicio_mes).count()
    
    # LGPD
    solicitacoes_pendentes_lgpd = SolicitacaoDados.objects.filter(
        status='pendente'
    ).count()
    consentimentos_ativos = ConsentimentoLGPD.objects.filter(
        consentido=True
    ).count()
    
    # ==================== GRÁFICOS ====================
    
    # Vendas por dia (últimos 30 dias)
    vendas_por_dia = list(
        Pedido.objects.filter(
            criado_em__gte=trinta_dias_atras,
            status__in=['processando', 'enviado', 'entregue']
        )
        .annotate(data=TruncDate('criado_em'))
        .values('data')
        .annotate(total=Sum('total'), quantidade=Count('id'))
        .order_by('data')
    )
    
    # Pedidos por status
    pedidos_por_status = list(
        Pedido.objects.values('status')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    
    # Produtos mais vendidos (top 10)
    produtos_mais_vendidos = list(
        ItemPedido.objects.filter(
            pedido__status__in=['processando', 'enviado', 'entregue']
        )
        .values('produto__nome')
        .annotate(quantidade=Sum('quantidade'))
        .order_by('-quantidade')[:10]
    )
    
    # Categorias mais vendidas
    categorias_mais_vendidas = list(
        ItemPedido.objects.filter(
            pedido__status__in=['processando', 'enviado', 'entregue']
        )
        .values('produto__categoria__nome')
        .annotate(total=Sum('quantidade'))
        .order_by('-total')[:5]
    )
    
    # Novos usuários por semana (últimos 3 meses)
    tres_meses_atras = hoje - timedelta(days=90)
    novos_usuarios_por_semana = list(
        User.objects.filter(date_joined__gte=tres_meses_atras)
        .annotate(semana=TruncWeek('date_joined'))
        .values('semana')
        .annotate(total=Count('id'))
        .order_by('semana')
    )
    
    # Métodos de pagamento
    metodos_pagamento = list(
        Pagamento.objects.values('metodo')
        .annotate(total=Count('id'), receita=Sum('valor'))
        .order_by('-total')
    )
    
    # Taxa de conversão (usuários que fizeram pedido)
    usuarios_com_pedido = Pedido.objects.values('usuario').distinct().count()
    taxa_conversao = round(
        (usuarios_com_pedido / total_usuarios * 100) if total_usuarios > 0 else 0,
        2
    )
    
    # Ticket médio
    ticket_medio = round(
        (total_vendas / total_pedidos) if total_pedidos > 0 else 0,
        2
    )
    
    # ==================== ALERTAS ====================
    
    alertas = []
    
    if produtos_sem_estoque > 0:
        alertas.append({
            'tipo': 'danger',
            'mensagem': f'{produtos_sem_estoque} produto(s) sem estoque',
            'icone': 'alert-circle'
        })
    
    if produtos_estoque_baixo > 0:
        alertas.append({
            'tipo': 'warning',
            'mensagem': f'{produtos_estoque_baixo} produto(s) com estoque baixo',
            'icone': 'alert-triangle'
        })
    
    if pedidos_pendentes > 5:
        alertas.append({
            'tipo': 'info',
            'mensagem': f'{pedidos_pendentes} pedido(s) aguardando processamento',
            'icone': 'shopping-cart'
        })
    
    if solicitacoes_pendentes_lgpd > 0:
        alertas.append({
            'tipo': 'warning',
            'mensagem': f'{solicitacoes_pendentes_lgpd} solicitação(ões) LGPD pendente(s)',
            'icone': 'shield'
        })
    
    context = {
        # Métricas
        'total_vendas': total_vendas,
        'vendas_mes': vendas_mes,
        'vendas_7dias': vendas_7dias,
        'total_pedidos': total_pedidos,
        'pedidos_pendentes': pedidos_pendentes,
        'pedidos_processando': pedidos_processando,
        'pedidos_mes': pedidos_mes,
        'total_usuarios': total_usuarios,
        'usuarios_mes': usuarios_mes,
        'usuarios_ativos_7dias': usuarios_ativos_7dias,
        'total_produtos': total_produtos,
        'produtos_estoque_baixo': produtos_estoque_baixo,
        'produtos_sem_estoque': produtos_sem_estoque,
        'total_avaliacoes': total_avaliacoes,
        'media_avaliacoes': round(media_avaliacoes, 1),
        'avaliacoes_mes': avaliacoes_mes,
        'solicitacoes_pendentes_lgpd': solicitacoes_pendentes_lgpd,
        'consentimentos_ativos': consentimentos_ativos,
        'taxa_conversao': taxa_conversao,
        'ticket_medio': ticket_medio,
        
        # Gráficos (convertidos para JSON)
        'vendas_por_dia_json': json.dumps(vendas_por_dia, default=str),
        'pedidos_por_status_json': json.dumps(pedidos_por_status),
        'produtos_mais_vendidos_json': json.dumps(produtos_mais_vendidos, default=str),
        'categorias_mais_vendidas_json': json.dumps(categorias_mais_vendidas, default=str),
        'novos_usuarios_json': json.dumps(novos_usuarios_por_semana, default=str),
        'metodos_pagamento_json': json.dumps(metodos_pagamento, default=str),
        
        # Alertas
        'alertas': alertas,
    }
    
    return render(request, 'admin/dashboard.html', context)


@staff_member_required
def relatorio_vendas(request):
    """Relatório detalhado de vendas com filtros."""
    
    # Filtros
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')
    status = request.GET.get('status')
    
    # Query base
    pedidos = Pedido.objects.all().select_related(
        'usuario', 'pagamento'
    ).prefetch_related('itens__produto')
    
    # Aplicar filtros
    if data_inicio:
        pedidos = pedidos.filter(criado_em__gte=data_inicio)
    if data_fim:
        pedidos = pedidos.filter(criado_em__lte=data_fim)
    if status:
        pedidos = pedidos.filter(status=status)
    
    # Estatísticas
    stats = pedidos.aggregate(
        total_vendas=Sum('total'),
        quantidade_pedidos=Count('id'),
        ticket_medio=Avg('total')
    )
    
    # Produtos vendidos - calculamos receita depois
    produtos_vendidos = ItemPedido.objects.filter(
        pedido__in=pedidos
    ).values(
        'produto__nome', 'produto__categoria__nome'
    ).annotate(
        quantidade=Sum('quantidade')
    ).order_by('-quantidade')
    
    context = {
        'ultimos_pedidos': pedidos.order_by('-criado_em')[:100],  # Últimos 100
        'total_vendas': stats['total_vendas'] or 0,
        'quantidade_pedidos': stats['quantidade_pedidos'] or 0,
        'ticket_medio': stats['ticket_medio'] or 0,
        'produtos_mais_vendidos': produtos_vendidos[:20],  # Top 20
        'data_inicio': data_inicio,
        'data_fim': data_fim,
        'status': status,
        'status_choices': Pedido.STATUS_CHOICES,
    }
    
    return render(request, 'admin/relatorio_vendas.html', context)


@staff_member_required
def relatorio_estoque(request):
    """Relatório de estoque de produtos."""
    
    # Produtos por situação de estoque com valor calculado
    produtos_ok = Produto.objects.filter(ativo=True, estoque__gte=10).select_related('categoria')
    produtos_baixo = Produto.objects.filter(ativo=True, estoque__lt=10, estoque__gt=0).select_related('categoria')
    produtos_esgotado = Produto.objects.filter(ativo=True, estoque=0).select_related('categoria')
    
    # Adicionar valor_estoque calculado a cada produto
    for produto in produtos_ok:
        produto.valor_estoque = produto.estoque * produto.preco
    
    # Produtos mais vendidos (para reposição)
    produtos_mais_vendidos = ItemPedido.objects.filter(
        pedido__criado_em__gte=timezone.now() - timedelta(days=30)
    ).values(
        'produto__id', 'produto__nome', 'produto__estoque'
    ).annotate(
        vendidos=Sum('quantidade')
    ).order_by('-vendidos')[:50]
    
    # Valor total em estoque - calcular manualmente
    produtos_ativos = Produto.objects.filter(ativo=True)
    valor_estoque = sum(p.estoque * p.preco for p in produtos_ativos)
    
    context = {
        'estoque_ok': produtos_ok,
        'estoque_baixo': produtos_baixo,
        'esgotados': produtos_esgotado,
        'mais_vendidos': produtos_mais_vendidos,
        'valor_total_estoque': valor_estoque,
        'total_produtos_ativos': produtos_ativos.count(),
    }
    
    return render(request, 'admin/relatorio_estoque.html', context)


@staff_member_required
def relatorio_usuarios(request):
    """Relatório de usuários e comportamento."""
    
    hoje = timezone.now().date()
    trinta_dias_atras = hoje - timedelta(days=30)
    
    # Usuários por atividade
    usuarios_ativos = User.objects.filter(
        last_login__gte=trinta_dias_atras
    ).count()
    
    usuarios_inativos = User.objects.filter(
        Q(last_login__lt=trinta_dias_atras) | Q(last_login__isnull=True)
    ).count()
    
    # Usuários com mais pedidos
    top_clientes = list(
        Pedido.objects.values(
            'usuario__id', 
            'usuario__username',
            'usuario__first_name',
            'usuario__email',
            'usuario__is_active'
        ).annotate(
            quantidade_pedidos=Count('id'),
            total_gasto=Sum('total'),
            ticket_medio=Avg('total')
        ).filter(quantidade_pedidos__gt=0).order_by('-total_gasto')[:20]
    )
    
    # Novos usuários por mês
    novos_por_mes = User.objects.filter(
        date_joined__gte=hoje - timedelta(days=180)
    ).annotate(
        mes=TruncMonth('date_joined')
    ).values('mes').annotate(
        total=Count('id')
    ).order_by('mes')
    
    # Taxa de retenção
    usuarios_com_mais_de_um_pedido = User.objects.annotate(
        num_pedidos=Count('pedidos')
    ).filter(num_pedidos__gt=1).count()
    
    usuarios_com_pedido = User.objects.annotate(
        num_pedidos=Count('pedidos')
    ).filter(num_pedidos__gt=0).count()
    
    taxa_retencao = round(
        (usuarios_com_mais_de_um_pedido / usuarios_com_pedido * 100) 
        if usuarios_com_pedido > 0 else 0,
        2
    )
    
    total_usuarios = User.objects.count()
    usuarios_mes = User.objects.filter(
        date_joined__gte=hoje.replace(day=1)
    ).count()
    
    percentual_ativos = round(
        (usuarios_ativos / total_usuarios * 100) if total_usuarios > 0 else 0,
        2
    )
    percentual_inativos = round(
        (usuarios_inativos / total_usuarios * 100) if total_usuarios > 0 else 0,
        2
    )
    
    context = {
        'total_usuarios': total_usuarios,
        'usuarios_ativos': usuarios_ativos,
        'usuarios_inativos': usuarios_inativos,
        'percentual_ativos': percentual_ativos,
        'percentual_inativos': percentual_inativos,
        'top_clientes': top_clientes,
        'novos_usuarios_por_mes_json': json.dumps(list(novos_por_mes), default=str),
        'taxa_retencao': taxa_retencao,
        'novos_usuarios_mes': usuarios_mes,
    }
    
    return render(request, 'admin/relatorio_usuarios.html', context)


@staff_member_required
def exportar_vendas_csv(request):
    """Exporta relatório de vendas em CSV."""
    
    response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    response['Content-Disposition'] = 'attachment; filename="relatorio_vendas.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID Pedido', 'Data', 'Cliente', 'Status', 'Total', 
        'Método Pagamento', 'Status Pagamento'
    ])
    
    pedidos = Pedido.objects.select_related(
        'usuario', 'pagamento'
    ).order_by('-criado_em')[:1000]
    
    for pedido in pedidos:
        writer.writerow([
            pedido.id,
            pedido.criado_em.strftime('%d/%m/%Y %H:%M'),
            pedido.usuario.username,
            pedido.get_status_display(),
            f'R$ {pedido.total}',
            pedido.pagamento.get_metodo_display() if hasattr(pedido, 'pagamento') else 'N/A',
            pedido.pagamento.get_status_display() if hasattr(pedido, 'pagamento') else 'N/A',
        ])
    
    return response


@staff_member_required
def exportar_estoque_csv(request):
    """Exporta relatório de estoque em CSV."""
    
    response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    response['Content-Disposition'] = 'attachment; filename="relatorio_estoque.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Produto', 'Categoria', 'Estoque', 'Preço', 
        'Valor Total', 'Status'
    ])
    
    produtos = Produto.objects.filter(ativo=True).select_related('categoria')
    
    for produto in produtos:
        valor_total = produto.estoque * produto.preco
        
        if produto.estoque == 0:
            status = 'Esgotado'
        elif produto.estoque < 10:
            status = 'Estoque Baixo'
        else:
            status = 'OK'
        
        writer.writerow([
            produto.id,
            produto.nome,
            produto.categoria.nome,
            produto.estoque,
            f'R$ {produto.preco}',
            f'R$ {valor_total}',
            status,
        ])
    
    return response
