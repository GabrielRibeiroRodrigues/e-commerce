'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import {
  Package, Clock, CheckCircle, Truck, XCircle, ChevronRight,
  CreditCard, Calendar,
} from 'lucide-react'
import type { PaginatedResponse, Pedido } from '@/types'

const STATUS_CONFIG: Record<string, { cor: string; bg: string; icon: typeof Clock; label?: string }> = {
  pendente:    { cor: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processando: { cor: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Package },
  enviado:     { cor: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck },
  entregue:    { cor: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  cancelado:   { cor: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
}

export default function PedidosPage() {
  const { status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      api.get<PaginatedResponse<Pedido>>('/pedidos/').then((r) => {
        setPedidos(r.data.results)
        setLoading(false)
      })
    }
  }, [status])

  if (status === 'loading' || loading) return <LoadingSpinner className="py-32" />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Meus Pedidos</h1>
          <p className="text-sm text-neutral-500">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total</p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum pedido ainda"
          description="Você ainda não realizou nenhuma compra. Explore nossos produtos e faça seu primeiro pedido!"
          cta={{ label: 'Explorar produtos', href: '/produtos' }}
        />
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const cfg = STATUS_CONFIG[pedido.status] || { cor: 'text-neutral-600', bg: 'bg-neutral-50 border-neutral-200', icon: Package }
            const Icon = cfg.icon

            return (
              <Link
                key={pedido.id}
                href={`/pedidos/${pedido.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-5 hover:border-brand-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Ícone de status */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.cor}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className="font-bold text-neutral-900">Pedido #{pedido.id}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.cor}`}>
                          {pedido.status_display}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(pedido.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>

                      <p className="text-sm text-neutral-600 line-clamp-1">
                        {pedido.itens.length} item{pedido.itens.length > 1 ? 'ns' : ''}
                        {pedido.itens.length > 0 && (
                          <>: <span className="font-medium">{pedido.itens[0].produto_nome}</span>
                          {pedido.itens.length > 1 && ` e mais ${pedido.itens.length - 1}`}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <p className="font-bold text-lg text-neutral-900">
                      R$ {parseFloat(pedido.total_com_frete).toFixed(2).replace('.', ',')}
                    </p>
                    {pedido.pagamento?.metodo_display && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <CreditCard className="w-3 h-3" />
                        {pedido.pagamento.metodo_display}
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>

                {/* Barra de progresso do status */}
                {pedido.status !== 'cancelado' && (
                  <div className="mt-4 flex items-center gap-1">
                    {['pendente', 'processando', 'enviado', 'entregue'].map((s, i) => {
                      const steps = ['pendente', 'processando', 'enviado', 'entregue']
                      const currentIdx = steps.indexOf(pedido.status)
                      const done = i <= currentIdx
                      return (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full transition-all ${done ? 'bg-brand-500' : 'bg-neutral-100'}`}
                        />
                      )
                    })}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
