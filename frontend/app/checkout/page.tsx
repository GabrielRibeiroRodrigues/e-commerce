'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCarrinho } from '@/store/carrinho'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { CheckoutData, Pedido } from '@/types'
import {
  MapPin, CreditCard, CheckCircle, Package,
  Zap, FileText, Lock, ShieldCheck, ChevronRight,
} from 'lucide-react'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const STEPS = [
  { label: 'Entrega', icon: MapPin },
  { label: 'Pagamento', icon: CreditCard },
  { label: 'Confirmação', icon: CheckCircle },
]

const METODOS = [
  { value: 'pix', label: 'PIX', icon: Zap, desc: 'Aprovação instantânea', cor: 'text-emerald-600' },
  { value: 'boleto', label: 'Boleto', icon: FileText, desc: '1–3 dias úteis', cor: 'text-orange-600' },
  { value: 'cartao_credito', label: 'Cartão', icon: CreditCard, desc: 'Até 12x sem juros', cor: 'text-blue-600' },
]

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { carrinho, fetchCarrinho, limpar } = useCarrinho()
  const [step, setStep] = useState(0) // 0=entrega, 1=pagamento
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
      setStep(0) // volta pro início em caso de erro
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <LoadingSpinner className="py-32" />
  if (!carrinho || carrinho.itens.length === 0) {
    router.push('/carrinho')
    return null
  }

  const total = parseFloat(carrinho.total)
  const enderecoCompleto = form.endereco && form.cidade && form.cep

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Step indicator ───────────────────────────────── */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const active = i === step
          const done = i < step
          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  done ? 'bg-brand-600 text-white' :
                  active ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
                  'bg-neutral-100 text-neutral-400'
                }`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${active ? 'text-brand-700' : done ? 'text-brand-500' : 'text-neutral-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-20 h-0.5 mx-3 mb-5 rounded transition-all ${i < step ? 'bg-brand-500' : 'bg-neutral-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-5">

            {/* ── Step 0: Endereço ─────────────────────── */}
            {step === 0 && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 animate-fade-in">
                <h2 className="font-bold text-neutral-900 text-lg mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-brand-600" />
                  </div>
                  Endereço de Entrega
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Endereço completo</label>
                    <input
                      name="endereco"
                      value={form.endereco}
                      onChange={handleChange}
                      required
                      placeholder="Rua, número, complemento, bairro"
                      className="input"
                    />
                    {erro.endereco && <p className="text-red-500 text-xs mt-1">{erro.endereco}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Cidade</label>
                      <input
                        name="cidade"
                        value={form.cidade}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Estado</label>
                      <select
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                        className="input"
                      >
                        {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">CEP</label>
                      <input
                        name="cep"
                        value={form.cep}
                        onChange={handleChange}
                        required
                        maxLength={9}
                        placeholder="00000-000"
                        className="input"
                      />
                      {erro.cep && <p className="text-red-500 text-xs mt-1">{erro.cep}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Telefone</label>
                      <input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        required
                        maxLength={15}
                        placeholder="(11) 9 0000-0000"
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={!enderecoCompleto}
                  className="btn btn-primary btn-lg w-full mt-6 disabled:opacity-40"
                >
                  Continuar para pagamento
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* ── Step 1: Pagamento ─────────────────────── */}
            {step === 1 && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 animate-fade-in">
                <div className="flex items-center gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    ←
                  </button>
                  <h2 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-brand-600" />
                    </div>
                    Forma de Pagamento
                  </h2>
                </div>

                {/* Métodos */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {METODOS.map((m) => {
                    const Icon = m.icon
                    return (
                      <label
                        key={m.value}
                        className={`flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                          form.metodo_pagamento === m.value
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="metodo_pagamento"
                          value={m.value}
                          checked={form.metodo_pagamento === m.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Icon className={`w-6 h-6 mb-2 ${form.metodo_pagamento === m.value ? m.cor : 'text-neutral-400'}`} />
                        <span className={`text-sm font-bold ${form.metodo_pagamento === m.value ? 'text-brand-700' : 'text-neutral-700'}`}>
                          {m.label}
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">{m.desc}</span>
                      </label>
                    )
                  })}
                </div>

                {/* PIX info */}
                {form.metodo_pagamento === 'pix' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                    <p className="font-semibold flex items-center gap-1.5 mb-1">
                      <Zap className="w-4 h-4" />
                      PIX — Aprovação instantânea
                    </p>
                    <p className="text-emerald-600 text-xs">O QR Code será gerado após a confirmação do pedido.</p>
                  </div>
                )}

                {/* Boleto info */}
                {form.metodo_pagamento === 'boleto' && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
                    <p className="font-semibold flex items-center gap-1.5 mb-1">
                      <FileText className="w-4 h-4" />
                      Boleto Bancário
                    </p>
                    <p className="text-orange-600 text-xs">Prazo de compensação: 1 a 3 dias úteis após o pagamento.</p>
                  </div>
                )}

                {/* Cartão */}
                {form.metodo_pagamento === 'cartao_credito' && (
                  <div className="space-y-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Número do cartão</label>
                      <input
                        name="numero_cartao"
                        value={form.numero_cartao}
                        onChange={handleChange}
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        className="input"
                      />
                      {erro.numero_cartao && <p className="text-red-500 text-xs mt-1">{erro.numero_cartao}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nome no cartão</label>
                      <input
                        name="nome_portador"
                        value={form.nome_portador}
                        onChange={handleChange}
                        placeholder="NOME SOBRENOME"
                        className="input uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Validade</label>
                        <input
                          name="validade"
                          value={form.validade}
                          onChange={handleChange}
                          maxLength={5}
                          placeholder="MM/AA"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">CVV</label>
                        <input
                          name="cvv"
                          value={form.cvv}
                          onChange={handleChange}
                          maxLength={4}
                          placeholder="000"
                          className="input"
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {erro.detail && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {erro.detail}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full mt-6"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? 'Processando...' : 'Confirmar Pedido com Segurança'}
                </button>
                <p className="text-center text-xs text-neutral-400 mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Seus dados são criptografados e protegidos
                </p>
              </div>
            )}
          </div>

          {/* ── Resumo ──────────────────────────────────── */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-24">
              <h2 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-600" />
                Resumo
              </h2>
              <div className="space-y-2.5 text-sm mb-5">
                {carrinho.itens.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2 text-neutral-600">
                    <span className="line-clamp-1 flex-1">{item.produto.nome}</span>
                    <span className="shrink-0 font-medium">×{item.quantidade}</span>
                    <span className="shrink-0 font-semibold">R$ {parseFloat(item.subtotal).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base pt-3 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="text-brand-700">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Resumo endereço no step 1 */}
              {step === 1 && form.endereco && (
                <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 border border-neutral-100">
                  <p className="font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Entrega para:
                  </p>
                  <p>{form.endereco}</p>
                  <p>{form.cidade} – {form.estado}, {form.cep}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
