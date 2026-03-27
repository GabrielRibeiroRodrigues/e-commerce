'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import ProdutoCard from '@/components/produto/ProdutoCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { ListaDesejo } from '@/types'

export default function DesejoPage() {
  const { status } = useSession()
  const router = useRouter()
  const [itens, setItens] = useState<ListaDesejo[]>([])
  const [loading, setLoading] = useState(true)

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
    await api.delete(`/desejos/${produtoId}/`)
    setItens((prev) => prev.filter((i) => i.produto.id !== produtoId))
  }

  if (status === 'loading' || loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Lista de Desejos</h1>

      {itens.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-4">Sua lista de desejos está vazia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {itens.map((item) => (
            <div key={item.id} className="relative">
              <ProdutoCard produto={item.produto} />
              <button
                onClick={() => remover(item.produto.id)}
                className="absolute top-2 right-2 bg-white/90 text-red-400 hover:text-red-600 rounded-full p-1.5 shadow transition-colors z-10"
                title="Remover da lista"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
