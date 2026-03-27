'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Package, ChevronLeft, CheckCircle, Clock, Truck, XCircle,
  MapPin, CreditCard, Copy, Check, Zap, FileText,
} from 'lucide-react'
import type { Pedido } from '@/types'

const STATUS_CONFIG: Record<string, { cor: string; bg: string; icon: typeof Clock; desc: string }> = {
  pendente:    { cor: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock, desc: 'Aguardando confirmação do pagamento' },
  processando: { cor: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Package, desc: 'Seu pedido está sendo preparado' },
  enviado:     { cor: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck, desc: 'Seu pedido está a caminho!' },
  entregue:    { cor: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, desc: 'Pedido entregue com sucesso!' },
  cancelado:   { cor: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle, desc: 'Pedido cancelado' },
}

const PAGAMENTO_STATUS: Record<string, { cor: string; bg: string; icon: typeof CheckCircle }> = {
  autorizado: { cor: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
  pendente:   { cor: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  recusado:   { cor: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
}

const METODO_ICONE: Record<string, typeof Zap> = {
  pix: Zap,
  boleto: FileText,
  cartao_credito: CreditCard,
}

export default function PedidoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { status } = useSession()
  const router = useRouter()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      api.get<Pedido>(`/pedidos/${id}/`).then((r) => {
        setPedido(r.data)
        setLoading(false)
      })
    }
  }, [status, id])

  function copiarCodigo(codigo: string) {
    navigator.clipboard.writeText(codigo).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  if (status === 'loading' || loading) return <LoadingSpinner className="py-32" />
  if (!pedido) return (
    <div className="max-w-3xl mx-auto px-4 py-32 text-center">
      <p className="text-neutral-500">Pedido não encontrado.</p>
      <Link href="/pedidos" className="btn btn-primary mt-4">Meus Pedidos</Link>
    </div>
  )

  const cfg = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.pendente
  const StatusIcon = cfg.icon
  const steps = ['pendente', 'processando', 'enviado', 'entregue']
  const currentStep = steps.indexOf(pedido.status)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Voltar */}
      <Link
        href="/pedidos"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-700 transition-colors mb-6 font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Meus Pedidos
      </Link>

      <div className="space-y-5">
        {/* ── Card principal ─────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-neutral-900">Pedido #{pedido.id}</h1>
              </div>
              <p className="text-sm text-neutral-500">
                {new Date(pedido.criado_em).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${cfg.bg} ${cfg.cor}`}>
              <StatusIcon className="w-4 h-4" />
              {pedido.status_display}
            </div>
          </div>

          {/* Timeline de status */}
          {pedido.status !== 'cancelado' && (
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-5 h-0.5 bg-neutral-100">
                  <div
                    className="h-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
                {[
                  { key: 'pendente', label: 'Confirmado', icon: CheckCircle },
                  { key: 'processando', label: 'Preparando', icon: Package },
                  { key: 'enviado', label: 'Enviado', icon: Truck },
                  { key: 'entregue', label: 'Entregue', icon: CheckCircle },
                ].map(({ key, label, icon: Icon }, i) => {
                  const done = i <= currentStep
                  return (
                    <div key={key} className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'bg-white border-neutral-200 text-neutral-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block ${done ? 'text-brand-700' : 'text-neutral-400'}`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-sm text-neutral-500 mt-6">{cfg.desc}</p>
            </div>
          )}

          {/* Itens */}
          <div>
            <h2 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              Itens do Pedido
            </h2>
            <div className="space-y-3">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-neutral-50 last:border-0 gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/produtos/${item.produto_slug}`} className="text-sm font-semibold text-neutral-900 hover:text-brand-700 transition-colors line-clamp-1">
                      {item.produto_nome}
                    </Link>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {item.quantidade}× R$ {parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <span className="font-bold text-neutral-900 shrink-0">
                    R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="mt-4 space-y-2 text-sm bg-neutral-50 rounded-xl p-4">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>R$ {parseFloat(pedido.total).toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Frete</span>
                <span className={parseFloat(pedido.valor_frete) === 0 ? 'text-emerald-600 font-semibold' : ''}>
                  {parseFloat(pedido.valor_frete) === 0 ? 'Grátis' : `R$ ${parseFloat(pedido.valor_frete).toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span className="text-brand-700">R$ {parseFloat(pedido.total_com_frete).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Entrega ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            Endereço de Entrega
          </h2>
          <div className="text-sm text-neutral-600 space-y-1">
            <p className="font-medium text-neutral-800">{pedido.endereco}</p>
            <p>{pedido.cidade} – {pedido.estado}, CEP {pedido.cep}</p>
            <p className="text-neutral-400">Tel: {pedido.telefone}</p>
          </div>
        </div>

        {/* ── Pagamento ───────────────────────────────────── */}
        {pedido.pagamento && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              Pagamento
            </h2>

            {(() => {
              const pagCfg = PAGAMENTO_STATUS[pedido.pagamento.status] || PAGAMENTO_STATUS.pendente
              const PagIcon = pagCfg.icon
              const MetodoIcon = METODO_ICONE[pedido.pagamento.metodo] || CreditCard

              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${pagCfg.bg} flex items-center justify-center`}>
                      <PagIcon className={`w-5 h-5 ${pagCfg.cor}`} />
                    </div>
                    <div>
                      <p className={`font-bold ${pagCfg.cor}`}>{pedido.pagamento.status_display}</p>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <MetodoIcon className="w-3.5 h-3.5" />
                        {pedido.pagamento.metodo_display}
                        {pedido.pagamento.cartao_final && ` •••• ${pedido.pagamento.cartao_final}`}
                      </div>
                    </div>
                  </div>

                  {pedido.pagamento.mensagem_retorno && (
                    <p className="text-sm text-neutral-500 bg-neutral-50 p-3 rounded-lg">
                      {pedido.pagamento.mensagem_retorno}
                    </p>
                  )}

                  {pedido.pagamento.codigo_confirmacao && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-1.5 font-semibold uppercase tracking-wider">Código de confirmação</p>
                      <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                        <code className="font-mono text-xs text-neutral-700 flex-1 break-all">
                          {pedido.pagamento.codigo_confirmacao}
                        </code>
                        <button
                          onClick={() => copiarCodigo(pedido.pagamento!.codigo_confirmacao)}
                          className="shrink-0 p-1.5 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-500"
                          title="Copiar código"
                        >
                          {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
