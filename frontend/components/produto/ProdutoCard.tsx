'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useCarrinho } from '@/store/carrinho'
import Estrelas from '@/components/ui/Estrelas'
import type { Produto } from '@/types'

export default function ProdutoCard({ produto }: { produto: Produto }) {
  const { data: session } = useSession()
  const { adicionarItem } = useCarrinho()
  const [adicionando, setAdicionando] = useState(false)
  const [adicionado, setAdicionado] = useState(false)

  async function handleAddCarrinho(e: React.MouseEvent) {
    e.preventDefault()
    if (!session) {
      window.location.href = '/login'
      return
    }
    setAdicionando(true)
    try {
      await adicionarItem(produto.id)
      setAdicionado(true)
      setTimeout(() => setAdicionado(false), 2000)
    } finally {
      setAdicionando(false)
    }
  }

  return (
    <Link href={`/produtos/${produto.slug}`} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-50">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {produto.tem_promocao && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
            Promoção
          </span>
        )}
        {!produto.disponivel && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-gray-500 font-medium text-sm">Indisponível</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-blue-600 mb-1">{produto.categoria.nome}</p>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{produto.nome}</h3>

        {produto.total_avaliacoes > 0 && (
          <div className="mb-2">
            <Estrelas media={produto.media_avaliacoes} total={produto.total_avaliacoes} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          {produto.tem_promocao && (
            <span className="text-xs text-gray-400 line-through">
              R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className={`font-bold ${produto.tem_promocao ? 'text-red-600' : 'text-gray-900'}`}>
            R$ {parseFloat(produto.preco_final).toFixed(2).replace('.', ',')}
          </span>
        </div>

        <button
          onClick={handleAddCarrinho}
          disabled={!produto.disponivel || adicionando}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            adicionado
              ? 'bg-green-500 text-white'
              : produto.disponivel
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {adicionado ? '✓ Adicionado' : adicionando ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </Link>
  )
}
