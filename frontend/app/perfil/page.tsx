'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { User, Mail, Calendar, Check, AlertCircle, Package, Heart, Edit2 } from 'lucide-react'
import type { Perfil } from '@/types'

export default function PerfilPage() {
  const { status, data: session } = useSession()
  const router = useRouter()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<Record<string, any>>({})

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      api.get<Perfil>('/perfil/').then((r) => {
        setPerfil(r.data)
        setLoading(false)
      })
    }
  }, [status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro({})
    setSalvando(true)
    try {
      const { data } = await api.put<Perfil>('/perfil/', perfil)
      setPerfil(data)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err: any) {
      setErro(err.response?.data || {})
    } finally {
      setSalvando(false)
    }
  }

  if (status === 'loading' || loading) return <LoadingSpinner className="py-32" />
  if (!perfil) return null

  const iniciais = [perfil.first_name, perfil.last_name]
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase())
    .join('') || perfil.username.charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Minha Conta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Coluna esquerda — Info do usuário ────────── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
              {iniciais}
            </div>
            <h2 className="font-bold text-neutral-900 text-lg">
              {[perfil.first_name, perfil.last_name].filter(Boolean).join(' ') || perfil.username}
            </h2>
            <p className="text-sm text-neutral-500">{perfil.email}</p>

            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-neutral-400">
              <Calendar className="w-3 h-3" />
              Membro desde {new Date(perfil.date_joined).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Links rápidos */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Atalhos</p>
            </div>
            {[
              { href: '/pedidos', icon: Package, label: 'Meus Pedidos', desc: 'Ver histórico de compras' },
              { href: '/desejos', icon: Heart, label: 'Lista de Desejos', desc: 'Produtos salvos' },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
              >
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{label}</p>
                  <p className="text-xs text-neutral-400">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Coluna direita — Formulário ──────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Edit2 className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-neutral-900">Editar Dados</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome e Sobrenome */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nome</label>
                  <input
                    value={perfil.first_name}
                    onChange={(e) => setPerfil({ ...perfil, first_name: e.target.value })}
                    placeholder="Seu nome"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Sobrenome</label>
                  <input
                    value={perfil.last_name}
                    onChange={(e) => setPerfil({ ...perfil, last_name: e.target.value })}
                    placeholder="Seu sobrenome"
                    className="input"
                  />
                </div>
              </div>

              {/* Usuário (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Usuário
                </label>
                <input
                  value={perfil.username}
                  disabled
                  className="input"
                  title="O nome de usuário não pode ser alterado"
                />
                <p className="text-xs text-neutral-400 mt-1">O nome de usuário não pode ser alterado.</p>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={perfil.email}
                  onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  className="input"
                />
                {erro.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {erro.email}
                  </p>
                )}
              </div>

              {/* Feedback */}
              {sucesso && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  Perfil atualizado com sucesso!
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={salvando}
                  className="btn btn-primary"
                >
                  {salvando ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Salvando...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
