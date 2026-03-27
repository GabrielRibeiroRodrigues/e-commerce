'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Perfil } from '@/types'

export default function PerfilPage() {
  const { status } = useSession()
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

  if (status === 'loading' || loading) return <LoadingSpinner className="py-20" />
  if (!perfil) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                value={perfil.first_name}
                onChange={(e) => setPerfil({ ...perfil, first_name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
              <input
                value={perfil.last_name}
                onChange={(e) => setPerfil({ ...perfil, last_name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input
              value={perfil.username}
              disabled
              className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={perfil.email}
              onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {erro.email && <p className="text-red-500 text-xs mt-1">{erro.email}</p>}
          </div>

          <div className="text-sm text-gray-400">
            Membro desde: {new Date(perfil.date_joined).toLocaleDateString('pt-BR')}
          </div>

          {sucesso && <p className="text-green-600 text-sm">✓ Perfil atualizado com sucesso.</p>}

          <button
            type="submit"
            disabled={salvando}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
