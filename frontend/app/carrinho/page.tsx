'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCarrinho } from '@/store/carrinho'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import api from '@/lib/api'

export default function CarrinhoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { carrinho, loading, fetchCarrinho, atualizarItem, removerItem } = useCarrinho()
  const [frete, setFrete] = useState<string | null>(null)
  const [cep, setCep] = useState('')
  const [calculandoFrete, setCalculandoFrete] = useState(false)
  const [erroFrete, setErroFrete] = useState('')

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

  if (status === 'loading' || loading) return <LoadingSpinner className="py-20" />
  if (!carrinho || carrinho.itens.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-400 mb-4">Seu carrinho está vazio.</p>
        <Link href="/produtos" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
          Ver produtos
        </Link>
      </div>
    )
  }

  const total = parseFloat(carrinho.total)
  const totalComFrete = frete ? total + parseFloat(frete) : total

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Carrinho de Compras</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Itens */}
        <div className="flex-1 space-y-4">
          {carrinho.itens.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                {item.produto.imagem_url ? (
                  <Image src={item.produto.imagem_url} alt={item.produto.nome} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/produtos/${item.produto.slug}`} className="font-medium text-gray-900 text-sm hover:text-blue-600 line-clamp-2">
                  {item.produto.nome}
                </Link>
                <p className="text-blue-600 font-semibold mt-1">
                  R$ {parseFloat(item.produto.preco_final).toFixed(2).replace('.', ',')}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => item.quantidade > 1 ? atualizarItem(item.produto.id, item.quantidade - 1) : removerItem(item.produto.id)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm"
                    >-</button>
                    <span className="px-3 py-1 text-sm border-x border-gray-200">{item.quantidade}</span>
                    <button
                      onClick={() => atualizarItem(item.produto.id, item.quantidade + 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removerItem(item.produto.id)}
                    className="text-red-400 hover:text-red-600 text-sm transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900">
                  R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Resumo do Pedido</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({carrinho.quantidade_total} itens)</span>
                <span className="font-medium">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              {frete && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Frete</span>
                  <span className="font-medium">R$ {parseFloat(frete).toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>R$ {totalComFrete.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Calcular frete */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Calcular Frete</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  maxLength={9}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={calcularFrete}
                  disabled={calculandoFrete}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {calculandoFrete ? '...' : 'OK'}
                </button>
              </div>
              {erroFrete && <p className="text-red-500 text-xs mt-1">{erroFrete}</p>}
              {frete && <p className="text-green-600 text-xs mt-1">✓ Frete: R$ {parseFloat(frete).toFixed(2).replace('.', ',')}</p>}
            </div>

            <Link
              href="/checkout"
              className="w-full block bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Finalizar Compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
