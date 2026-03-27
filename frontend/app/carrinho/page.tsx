'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCarrinho } from '@/store/carrinho'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/lib/api'
import {
  ShoppingCart, Minus, Plus, Trash2, MapPin, ArrowRight,
  Tag, Truck, ShieldCheck, Package,
} from 'lucide-react'

export default function CarrinhoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { carrinho, loading, fetchCarrinho, atualizarItem, removerItem } = useCarrinho()
  const [frete, setFrete] = useState<string | null>(null)
  const [cep, setCep] = useState('')
  const [calculandoFrete, setCalculandoFrete] = useState(false)
  const [erroFrete, setErroFrete] = useState('')
  const [removendo, setRemovendo] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchCarrinho()
  }, [status])

  async function calcularFrete() {
    setErroFrete('')
    setCalculandoFrete(true)
    try {
      const { data } = await api.post('/frete/calcular/', { cep })
      setFrete(data.valor_frete)
    } catch (err: any) {
      setErroFrete(err.response?.data?.detail || 'CEP inválido.')
    } finally {
      setCalculandoFrete(false)
    }
  }

  async function handleRemover(produtoId: number) {
    setRemovendo(produtoId)
    await removerItem(produtoId)
    setRemovendo(null)
  }

  if (status === 'loading' || loading) return <LoadingSpinner className="py-32" />

  if (!carrinho || carrinho.itens.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione produtos ao carrinho para continuar comprando."
          cta={{ label: 'Explorar produtos', href: '/produtos' }}
        />
      </div>
    )
  }

  const total = parseFloat(carrinho.total)
  const freteNum = frete ? parseFloat(frete) : null
  const totalComFrete = freteNum !== null ? total + freteNum : total
  const freteGratis = total >= 150

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Carrinho de Compras</h1>
          <p className="text-sm text-neutral-500">{carrinho.quantidade_total} item{carrinho.quantidade_total > 1 ? 'ns' : ''}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Itens ──────────────────────────────────────── */}
        <div className="flex-1 space-y-3">
          {/* Banner frete grátis */}
          {!freteGratis && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-800">
                Adicione mais{' '}
                <strong>R$ {(150 - total).toFixed(2).replace('.', ',')}</strong>{' '}
                para ganhar <strong>frete grátis</strong>!
              </span>
              <div className="ml-auto w-24 bg-amber-200 rounded-full h-2 shrink-0">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (total / 150) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {freteGratis && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-800 font-semibold">🎉 Você ganhou frete grátis!</span>
            </div>
          )}

          {/* Itens */}
          {carrinho.itens.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-neutral-200 p-4 flex gap-4 transition-opacity ${removendo === item.produto.id ? 'opacity-50' : ''}`}
            >
              {/* Imagem */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0">
                {item.produto.imagem_url ? (
                  <Image src={item.produto.imagem_url} alt={item.produto.nome} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-neutral-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produtos/${item.produto.slug}`}
                  className="font-semibold text-neutral-900 text-sm hover:text-brand-700 line-clamp-2 leading-snug transition-colors"
                >
                  {item.produto.nome}
                </Link>
                <p className="text-xs text-brand-600 font-medium mt-0.5">{item.produto.categoria.nome}</p>

                <div className="flex items-center gap-3 mt-3">
                  {/* Quantidade */}
                  <div className="flex items-center bg-neutral-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => item.quantidade > 1
                        ? atualizarItem(item.produto.id, item.quantidade - 1)
                        : handleRemover(item.produto.id)
                      }
                      className="p-2 text-neutral-600 hover:bg-neutral-200 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-neutral-900 min-w-[2.5rem] text-center">{item.quantidade}</span>
                    <button
                      onClick={() => atualizarItem(item.produto.id, item.quantidade + 1)}
                      className="p-2 text-neutral-600 hover:bg-neutral-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remover */}
                  <button
                    onClick={() => handleRemover(item.produto.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>
              </div>

              {/* Preço */}
              <div className="text-right shrink-0">
                <p className="font-bold text-neutral-900">
                  R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  R$ {parseFloat(item.produto.preco_final).toFixed(2).replace('.', ',')} cada
                </p>
                {item.produto.tem_promocao && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded mt-1">
                    <Tag className="w-2.5 h-2.5" />
                    Promoção
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Continuar comprando */}
          <div className="pt-2">
            <Link href="/produtos" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1.5">
              ← Continuar comprando
            </Link>
          </div>
        </div>

        {/* ── Resumo ─────────────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-24">
            <h2 className="font-bold text-neutral-900 mb-5 text-lg">Resumo do Pedido</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({carrinho.quantidade_total} item{carrinho.quantidade_total > 1 ? 's' : ''})</span>
                <span className="font-semibold">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              {frete !== null && (
                <div className="flex justify-between text-neutral-600">
                  <span>Frete</span>
                  <span className={`font-semibold ${parseFloat(frete) === 0 ? 'text-emerald-600' : ''}`}>
                    {parseFloat(frete) === 0 ? 'Grátis' : `R$ ${parseFloat(frete).toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-3 border-t border-neutral-100">
                <span>Total</span>
                <span className="text-brand-700">R$ {totalComFrete.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Calcular frete */}
            <div className="mb-5 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                Calcular Frete
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && calcularFrete()}
                  maxLength={9}
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
                <button
                  onClick={calcularFrete}
                  disabled={calculandoFrete || cep.length < 8}
                  className="btn btn-primary btn-sm px-4 rounded-lg disabled:opacity-50"
                >
                  {calculandoFrete ? '...' : 'OK'}
                </button>
              </div>
              {erroFrete && <p className="text-red-500 text-xs mt-2">{erroFrete}</p>}
              {frete !== null && (
                <p className="text-emerald-600 text-xs mt-2 font-semibold flex items-center gap-1">
                  ✓ Frete calculado: {parseFloat(frete) === 0 ? 'Grátis' : `R$ ${parseFloat(frete).toFixed(2).replace('.', ',')}`}
                </p>
              )}
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3.5 rounded-2xl font-bold hover:bg-brand-700 transition-all hover:shadow-lg hover:shadow-brand-200 active:scale-[0.98]"
            >
              Finalizar Compra
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Garantias */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                Compra segura
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Truck className="w-3.5 h-3.5 text-brand-500" />
                Entrega garantida
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
