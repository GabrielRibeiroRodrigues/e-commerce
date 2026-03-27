'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api'
import { useCarrinho } from '@/store/carrinho'
import Estrelas from '@/components/ui/Estrelas'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Produto } from '@/types'

export default function ProdutoDetalhe() {
  const { slug } = useParams<{ slug: string }>()
  const { data: session } = useSession()
  const { adicionarItem } = useCarrinho()

  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [adicionando, setAdicionando] = useState(false)
  const [adicionado, setAdicionado] = useState(false)
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false)
  const [erroAvaliacao, setErroAvaliacao] = useState('')

  useEffect(() => {
    api.get<Produto>(`/produtos/${slug}/`).then((r) => {
      setProduto(r.data)
      setLoading(false)
    })
  }, [slug])

  async function handleAddCarrinho() {
    if (!session) { window.location.href = '/login'; return }
    setAdicionando(true)
    try {
      await adicionarItem(produto!.id, quantidade)
      setAdicionado(true)
      setTimeout(() => setAdicionado(false), 2000)
    } finally {
      setAdicionando(false)
    }
  }

  async function handleAvaliacao(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setErroAvaliacao('Selecione uma nota.'); return }
    setEnviandoAvaliacao(true)
    setErroAvaliacao('')
    try {
      await api.post(`/produtos/${produto!.id}/avaliacao/`, { rating, comentario })
      const { data } = await api.get<Produto>(`/produtos/${slug}/`)
      setProduto(data)
      setRating(0)
      setComentario('')
    } catch (err: any) {
      setErroAvaliacao(err.response?.data?.detail || 'Erro ao enviar avaliação.')
    } finally {
      setEnviandoAvaliacao(false)
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />
  if (!produto) return <div className="text-center py-20 text-gray-400">Produto não encontrado.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/produtos" className="hover:text-blue-600">Produtos</Link>
        <span>/</span>
        <Link href={`/produtos?categoria=${produto.categoria.slug}`} className="hover:text-blue-600">{produto.categoria.nome}</Link>
        <span>/</span>
        <span className="text-gray-700">{produto.nome}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-2xl border border-gray-200 p-6 lg:p-10">
        {/* Imagem */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
          {produto.imagem_url ? (
            <Image src={produto.imagem_url} alt={produto.nome} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex flex-col">
          <p className="text-sm text-blue-600 mb-1">{produto.categoria.nome}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{produto.nome}</h1>

          {produto.total_avaliacoes > 0 && (
            <div className="mb-4">
              <Estrelas media={produto.media_avaliacoes} total={produto.total_avaliacoes} />
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            {produto.tem_promocao && (
              <span className="text-gray-400 line-through text-lg">
                R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className={`text-3xl font-bold ${produto.tem_promocao ? 'text-red-600' : 'text-gray-900'}`}>
              R$ {parseFloat(produto.preco_final).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{produto.descricao}</p>

          {produto.disponivel ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                >-</button>
                <span className="px-4 py-2 font-medium border-x border-gray-200">{quantidade}</span>
                <button
                  onClick={() => setQuantidade((q) => Math.min(produto.estoque, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                >+</button>
              </div>
              <button
                onClick={handleAddCarrinho}
                disabled={adicionando}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors ${adicionado ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {adicionado ? '✓ Adicionado!' : adicionando ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </button>
            </div>
          ) : (
            <p className="text-red-500 font-medium mb-4">Produto indisponível</p>
          )}

          <p className="text-sm text-gray-400">Estoque: {produto.estoque} unidades</p>
        </div>
      </div>

      {/* Avaliações */}
      <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 lg:p-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Avaliações ({produto.total_avaliacoes})</h2>

        {session && !produto.usuario_ja_avaliou && (
          <form onSubmit={handleAvaliacao} className="mb-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-3">Deixe sua avaliação</h3>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className={`text-2xl transition-transform hover:scale-110 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >★</button>
              ))}
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentário (opcional)"
              rows={3}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            {erroAvaliacao && <p className="text-red-500 text-sm mb-2">{erroAvaliacao}</p>}
            <button
              type="submit"
              disabled={enviandoAvaliacao}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        )}

        {produto.avaliacoes && produto.avaliacoes.length > 0 ? (
          <div className="space-y-4">
            {produto.avaliacoes.map((av) => (
              <div key={av.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{av.usuario_nome || av.usuario_username}</span>
                  <Estrelas media={av.rating} total={0} />
                </div>
                {av.comentario && <p className="text-sm text-gray-600">{av.comentario}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(av.criado_em).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Nenhuma avaliação ainda.</p>
        )}
      </div>
    </div>
  )
}
