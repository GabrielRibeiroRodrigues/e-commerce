'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useCarrinho } from '@/store/carrinho'
import Estrelas from '@/components/ui/Estrelas'
import { ShoppingCart, Check, ImageOff, Tag } from 'lucide-react'
import type { Produto } from '@/types'

export default function ProdutoCard({ produto }: { produto: Produto }) {
  const { data: session } = useSession()
  const { adicionarItem } = useCarrinho()
  const [adicionando, setAdicionando] = useState(false)
  const [adicionado, setAdicionado] = useState(false)

  const desconto = produto.tem_promocao && produto.preco_promocional
    ? Math.round((1 - parseFloat(produto.preco_final) / parseFloat(produto.preco)) * 100)
    : null

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
      setTimeout(() => setAdicionado(false), 2200)
    } finally {
      setAdicionando(false)
    }
  }

  return (
    <Link
      href={`/produtos/${produto.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-brand-200"
    >
      {/* Imagem */}
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 gap-2">
            <ImageOff className="w-10 h-10" strokeWidth={1} />
            <span className="text-xs">Sem imagem</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {desconto !== null && (
            <span className="badge bg-accent-500 text-white text-[10px] shadow-sm">
              <Tag className="w-2.5 h-2.5" />
              -{desconto}%
            </span>
          )}
          {produto.destaque && !produto.tem_promocao && (
            <span className="badge bg-brand-600 text-white text-[10px] shadow-sm">
              ⭐ Destaque
            </span>
          )}
        </div>

        {/* Indisponível */}
        {!produto.disponivel && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-neutral-500 font-semibold text-sm bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-neutral-200">
              Indisponível
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-[11px] text-brand-600 font-semibold uppercase tracking-wider">{produto.categoria.nome}</p>
        <h3 className="font-semibold text-neutral-800 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors flex-1">
          {produto.nome}
        </h3>

        {produto.total_avaliacoes > 0 && (
          <Estrelas media={produto.media_avaliacoes} total={produto.total_avaliacoes} />
        )}

        {/* Preço */}
        <div className="flex items-baseline gap-1.5 mt-1">
          {produto.tem_promocao && (
            <span className="text-xs text-neutral-400 line-through">
              R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className={`text-base font-bold ${produto.tem_promocao ? 'text-red-600' : 'text-neutral-900'}`}>
            R$ {parseFloat(produto.preco_final).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Botão */}
        <button
          onClick={handleAddCarrinho}
          disabled={!produto.disponivel || adicionando}
          className={`mt-1 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            adicionado
              ? 'bg-emerald-500 text-white scale-[0.98]'
              : produto.disponivel
              ? 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {adicionado ? (
            <>
              <Check className="w-4 h-4" />
              Adicionado!
            </>
          ) : adicionando ? (
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Adicionar
            </>
          )}
        </button>
      </div>
    </Link>
  )
}
