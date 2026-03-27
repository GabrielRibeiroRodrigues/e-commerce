'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCarrinho } from '@/store/carrinho'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { CheckoutData, Pedido } from '@/types'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { carrinho, fetchCarrinho, limpar } = useCarrinho()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<Record<string, any>>({})
  const [form, setForm] = useState<CheckoutData>({
    endereco: '', cidade: '', estado: 'SP', cep: '', telefone: '',
    metodo_pagamento: 'pix',
    numero_cartao: '', nome_portador: '', validade: '', cvv: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchCarrinho()
  }, [status])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro({})
    setLoading(true)
    try {
      const { data } = await api.post<Pedido>('/checkout/', form)
      limpar()
      router.push(`/pedidos/${data.id}`)
    } catch (err: any) {
      setErro(err.response?.data || { detail: 'Erro ao processar pedido.' })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <LoadingSpinner className="py-20" />
  if (!carrinho || carrinho.itens.length === 0) {
    router.push('/carrinho')
    return null
  }

  const total = parseFloat(carrinho.total)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Entrega */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Endereço de Entrega</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço completo</label>
                  <input name="endereco" value={form.endereco} onChange={handleChange} required
                    placeholder="Rua, número, complemento"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {erro.endereco && <p className="text-red-500 text-xs mt-1">{erro.endereco}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input name="cidade" value={form.cidade} onChange={handleChange} required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select name="estado" value={form.estado} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input name="cep" value={form.cep} onChange={handleChange} required maxLength={9} placeholder="00000-000"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {erro.cep && <p className="text-red-500 text-xs mt-1">{erro.cep}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input name="telefone" value={form.telefone} onChange={handleChange} required maxLength={15}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Pagamento</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { value: 'pix', label: '⚡ PIX' },
                  { value: 'boleto', label: '📄 Boleto' },
                  { value: 'cartao_credito', label: '💳 Cartão' },
                ].map((m) => (
                  <label key={m.value} className={`flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-colors text-sm font-medium ${form.metodo_pagamento === m.value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="metodo_pagamento" value={m.value} checked={form.metodo_pagamento === m.value} onChange={handleChange} className="sr-only" />
                    {m.label}
                  </label>
                ))}
              </div>

              {form.metodo_pagamento === 'cartao_credito' && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número do cartão</label>
                    <input name="numero_cartao" value={form.numero_cartao} onChange={handleChange} maxLength={19} placeholder="0000 0000 0000 0000"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {erro.numero_cartao && <p className="text-red-500 text-xs mt-1">{erro.numero_cartao}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome no cartão</label>
                    <input name="nome_portador" value={form.nome_portador} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                      <input name="validade" value={form.validade} onChange={handleChange} maxLength={5} placeholder="MM/AA"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input name="cvv" value={form.cvv} onChange={handleChange} maxLength={4} placeholder="000"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              )}

              {form.metodo_pagamento === 'pix' && (
                <p className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">⚡ PIX aprovado instantaneamente após a confirmação.</p>
              )}
              {form.metodo_pagamento === 'boleto' && (
                <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">📄 Boleto gerado após confirmação. Prazo de compensação: 1-3 dias úteis.</p>
              )}
            </div>

            {erro.detail && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{erro.detail}</p>}
          </div>

          {/* Resumo */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Resumo</h2>
              <div className="space-y-2 text-sm mb-6">
                {carrinho.itens.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="line-clamp-1 flex-1 mr-2">{item.produto.nome} x{item.quantidade}</span>
                    <span className="shrink-0">R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
