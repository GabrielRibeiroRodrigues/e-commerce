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
import Breadcrumb from '@/components/ui/Breadcrumb'
import {
  ShoppingCart, Check, Minus, Plus, Truck, ShieldCheck,
  RotateCcw, ImageOff, Tag, Star, MessageSquare, AlertCircle,
} from 'lucide-react'
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
  const [hoverRating, setHoverRating] = useState(0)
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
      setTimeout(() => setAdicionado(false), 2500)
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

  const desconto = produto?.tem_promocao && produto?.preco_promocional
    ? Math.round((1 - parseFloat(produto.preco_final) / parseFloat(produto.preco)) * 100)
    : null

  if (loading) return <LoadingSpinner className="py-32" />
  if (!produto) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
      <p className="text-neutral-500">Produto não encontrado.</p>
      <Link href="/produtos" className="btn btn-primary mt-4">Ver produtos</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[
        { label: 'Produtos', href: '/produtos' },
        { label: produto.categoria.nome, href: `/produtos?categoria=${produto.categoria.slug}` },
        { label: produto.nome },
      ]} />

      {/* ── Principal ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl border border-neutral-200 p-6 lg:p-10 shadow-sm">
        {/* Imagem */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
          {produto.imagem_url ? (
            <Image
              src={produto.imagem_url}
              alt={produto.nome}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 gap-3">
              <ImageOff className="w-16 h-16" strokeWidth={1} />
              <p className="text-sm">Sem imagem</p>
            </div>
          )}

          {/* Badges sobre a imagem */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {desconto !== null && (
              <span className="badge bg-red-500 text-white shadow-md text-sm px-3 py-1">
                <Tag className="w-3.5 h-3.5" />
                -{desconto}% OFF
              </span>
            )}
            {produto.destaque && (
              <span className="badge bg-brand-600 text-white shadow-md text-sm px-3 py-1">
                ⭐ Destaque
              </span>
            )}
          </div>
        </div>

        {/* Informações */}
        <div className="flex flex-col">
          <Link href={`/produtos?categoria=${produto.categoria.slug}`} className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-2 hover:underline">
            {produto.categoria.nome}
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-3 leading-snug">{produto.nome}</h1>

          {produto.total_avaliacoes > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <Estrelas media={produto.media_avaliacoes} total={produto.total_avaliacoes} />
              <span className="text-sm text-neutral-400">·</span>
              <button
                onClick={() => document.getElementById('avaliacoes')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-brand-600 hover:underline font-medium"
              >
                {produto.total_avaliacoes} avaliação{produto.total_avaliacoes > 1 ? 'ões' : ''}
              </button>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-baseline gap-3 mb-5 p-4 bg-neutral-50 rounded-2xl">
            {produto.tem_promocao && (
              <span className="text-neutral-400 line-through text-base">
                R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className={`text-3xl font-bold ${produto.tem_promocao ? 'text-red-600' : 'text-neutral-900'}`}>
              R$ {parseFloat(produto.preco_final).toFixed(2).replace('.', ',')}
            </span>
            {produto.tem_promocao && (
              <span className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg">
                Economia de R$ {(parseFloat(produto.preco) - parseFloat(produto.preco_final)).toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          {produto.descricao && (
            <p className="text-neutral-600 leading-relaxed mb-5 text-sm">{produto.descricao}</p>
          )}

          {produto.disponivel ? (
            <div className="space-y-3 mb-5">
              {/* Seletor de quantidade */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-600">Quantidade:</span>
                <div className="flex items-center bg-neutral-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-neutral-600 hover:bg-neutral-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2 font-bold text-neutral-900 min-w-[3rem] text-center">{quantidade}</span>
                  <button
                    onClick={() => setQuantidade((q) => Math.min(produto.estoque, q + 1))}
                    className="p-2.5 text-neutral-600 hover:bg-neutral-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-neutral-400">{produto.estoque} disponíveis</span>
              </div>

              {/* Botão adicionar */}
              <button
                onClick={handleAddCarrinho}
                disabled={adicionando}
                className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base transition-all duration-200 ${
                  adicionado
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200 active:scale-[0.98]'
                }`}
              >
                {adicionado ? (
                  <>
                    <Check className="w-5 h-5" />
                    Adicionado ao carrinho!
                  </>
                ) : adicionando ? (
                  'Adicionando...'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Adicionar ao Carrinho
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-600 font-semibold text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Produto temporariamente indisponível
              </p>
              <p className="text-red-400 text-xs mt-1">Em breve este produto estará disponível novamente.</p>
            </div>
          )}

          {/* Garantias */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100">
            {[
              { icon: Truck, label: 'Entrega em todo BR' },
              { icon: ShieldCheck, label: 'Compra segura' },
              { icon: RotateCcw, label: 'Troca em 7 dias' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-[10px] text-neutral-500 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Avaliações ──────────────────────────────────── */}
      <div id="avaliacoes" className="mt-8 bg-white rounded-3xl border border-neutral-200 p-6 lg:p-10 shadow-sm scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Avaliações
            {produto.total_avaliacoes > 0 && (
              <span className="text-sm font-normal text-neutral-400">({produto.total_avaliacoes})</span>
            )}
          </h2>
          {produto.total_avaliacoes > 0 && (
            <div className="text-right">
              <p className="text-3xl font-bold text-neutral-900">{produto.media_avaliacoes.toFixed(1)}</p>
              <Estrelas media={produto.media_avaliacoes} total={0} showTotal={false} />
            </div>
          )}
        </div>

        {/* Formulário de avaliação */}
        {session && !produto.usuario_ja_avaliou && (
          <form onSubmit={handleAvaliacao} className="mb-8 p-5 bg-brand-50 rounded-2xl border border-brand-100">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Deixe sua avaliação
            </h3>

            {/* Estrelas interativas */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125"
                >
                  <svg
                    className={`w-8 h-8 transition-colors ${
                      i <= (hoverRating || rating) ? 'text-amber-400' : 'text-neutral-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {(hoverRating || rating) > 0 && (
                <span className="text-sm text-neutral-500 self-center ml-2">
                  {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][hoverRating || rating]}
                </span>
              )}
            </div>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte sua experiência com este produto (opcional)..."
              rows={3}
              className="input resize-none mb-3"
            />
            {erroAvaliacao && (
              <p className="text-red-500 text-sm mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {erroAvaliacao}
              </p>
            )}
            <button
              type="submit"
              disabled={enviandoAvaliacao}
              className="btn btn-primary btn-sm"
            >
              {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        )}

        {/* Lista de avaliações */}
        {produto.avaliacoes && produto.avaliacoes.length > 0 ? (
          <div className="space-y-5">
            {produto.avaliacoes.map((av) => (
              <div key={av.id} className="flex gap-4 pb-5 border-b border-neutral-50 last:border-0">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                  {(av.usuario_nome || av.usuario_username).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm text-neutral-900">{av.usuario_nome || av.usuario_username}</span>
                    <Estrelas media={av.rating} total={0} showTotal={false} />
                    <span className="text-xs text-neutral-400 ml-auto">
                      {new Date(av.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {av.comentario && (
                    <p className="text-sm text-neutral-600 leading-relaxed">{av.comentario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Star className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">Nenhuma avaliação ainda.</p>
            {session && !produto.usuario_ja_avaliou && (
              <p className="text-brand-600 text-sm mt-1 font-medium">Seja o primeiro a avaliar!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
