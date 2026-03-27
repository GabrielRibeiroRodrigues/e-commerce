'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Pedido } from '@/types'

const STATUS_CORES: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  processando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-purple-100 text-purple-700',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

const PAGAMENTO_ICONE: Record<string, string> = {
  autorizado: '✅',
  pendente: '⏳',
  recusado: '❌',
}

export default function PedidoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { status } = useSession()
  const router = useRouter()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      api.get<Pedido>(`/pedidos/${id}/`).then((r) => {
        setPedido(r.data)
        setLoading(false)
      })
    }
  }, [status, id])

  if (status === 'loading' || loading) return <LoadingSpinner className="py-20" />
  if (!pedido) return <div className="text-center py-20 text-gray-400">Pedido não encontrado.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/pedidos" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Meus Pedidos
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.id}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date(pedido.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_CORES[pedido.status] || 'bg-gray-100 text-gray-600'}`}>
            {pedido.status_display}
          </span>
        </div>

        {/* Itens */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Itens do Pedido</h2>
          <div className="space-y-3">
            {pedido.itens.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <Link href={`/produtos/${item.produto_slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {item.produto_nome}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {item.quantidade}x R$ {parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <span className="font-medium text-sm">
                  R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>R$ {parseFloat(pedido.total).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Frete</span>
              <span>R$ {parseFloat(pedido.valor_frete).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>R$ {parseFloat(pedido.total_com_frete).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Entrega */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">Endereço de Entrega</h2>
          <p className="text-sm text-gray-600">{pedido.endereco}</p>
          <p className="text-sm text-gray-600">{pedido.cidade} - {pedido.estado}, {pedido.cep}</p>
          <p className="text-sm text-gray-600">{pedido.telefone}</p>
        </div>

        {/* Pagamento */}
        {pedido.pagamento && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Pagamento</h2>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <p>
                {PAGAMENTO_ICONE[pedido.pagamento.status]} <strong>{pedido.pagamento.status_display}</strong> — {pedido.pagamento.metodo_display}
              </p>
              {pedido.pagamento.mensagem_retorno && (
                <p className="text-gray-500">{pedido.pagamento.mensagem_retorno}</p>
              )}
              {pedido.pagamento.codigo_confirmacao && (
                <p className="font-mono text-xs bg-white border border-gray-200 rounded p-2 mt-2 break-all">
                  {pedido.pagamento.codigo_confirmacao}
                </p>
              )}
              {pedido.pagamento.cartao_final && (
                <p className="text-gray-500">Cartão final {pedido.pagamento.cartao_final}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
