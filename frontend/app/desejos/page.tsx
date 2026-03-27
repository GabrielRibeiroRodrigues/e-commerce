'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import ProdutoCard from '@/components/produto/ProdutoCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { Heart, Trash2 } from 'lucide-react'
import type { ListaDesejo } from '@/types'

export default function DesejoPage() {
  const { status } = useSession()
  const router = useRouter()
  const [itens, setItens] = useState<ListaDesejo[]>([])
  const [loading, setLoading] = useState(true)
  const [removendo, setRemovendo] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      api.get<{ results?: ListaDesejo[] } | ListaDesejo[]>('/desejos/').then((r) => {
        const data = Array.isArray(r.data) ? r.data : (r.data as any).results ?? []
        setItens(data)
        setLoading(false)
      })
    }
  }, [status])

  async function remover(produtoId: number) {
    setRemovendo(produtoId)
    await api.delete(`/desejos/${produtoId}/`)
    setItens((prev) => prev.filter((i) => i.produto.id !== produtoId))
    setRemovendo(null)
  }

  if (status === 'loading' || loading) return <LoadingSpinner className="py-32" />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lista de Desejos</h1>
          <p className="text-sm text-neutral-500">
            {itens.length} produto{itens.length !== 1 ? 's' : ''} salvos
          </p>
        </div>
      </div>

      {itens.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Sua lista de desejos está vazia"
          description="Salve os produtos que você ama para comprar depois. Nunca mais perca uma oferta!"
          cta={{ label: 'Explorar produtos', href: '/produtos' }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {itens.map((item) => (
            <div key={item.id} className={`relative group transition-opacity ${removendo === item.produto.id ? 'opacity-40 pointer-events-none' : ''}`}>
              <ProdutoCard produto={item.produto} />

              {/* Botão remover */}
              <button
                onClick={() => remover(item.produto.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-white/95 backdrop-blur-sm text-red-400 hover:text-white hover:bg-red-500 rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-10 border border-neutral-100"
                title="Remover da lista"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Data adicionado */}
              <p className="text-center text-[10px] text-neutral-400 mt-1.5">
                Adicionado em {new Date(item.criado_em).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
