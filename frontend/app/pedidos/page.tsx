'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { PaginatedResponse, Pedido } from '@/types'

const STATUS_CORES: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  processando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-purple-100 text-purple-700',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
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

  if (status === 'loading' || loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-4">Você ainda não fez nenhum pedido.</p>
          <Link href="/produtos" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <Link
              key={pedido.id}
              href={`/pedidos/${pedido.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">Pedido #{pedido.id}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CORES[pedido.status] || 'bg-gray-100 text-gray-600'}`}>
                      {pedido.status_display}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(pedido.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {pedido.itens.length} item{pedido.itens.length > 1 ? 's' : ''}
                    {pedido.itens.length > 0 && `: ${pedido.itens[0].produto_nome}${pedido.itens.length > 1 ? ` e mais ${pedido.itens.length - 1}` : ''}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">
                    R$ {parseFloat(pedido.total_com_frete).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {pedido.pagamento?.metodo_display}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
