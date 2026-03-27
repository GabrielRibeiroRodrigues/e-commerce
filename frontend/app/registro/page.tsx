'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  })
  const [erro, setErro] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro({})
    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/registro/`, form)
      await signIn('credentials', { username: form.username, password: form.password, redirect: false })
      router.push('/')
    } catch (err: any) {
      setErro(err.response?.data || { geral: 'Erro ao criar conta.' })
    } finally {
      setLoading(false)
    }
  }

  const campos = [
    { name: 'first_name', label: 'Nome', type: 'text' },
    { name: 'last_name', label: 'Sobrenome', type: 'text' },
    { name: 'username', label: 'Usuário', type: 'text' },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'password', label: 'Senha', type: 'password' },
    { name: 'password2', label: 'Confirmar Senha', type: 'password' },
  ]

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar conta</h1>
        <p className="text-gray-500 text-sm mb-6">Preencha os dados para se cadastrar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {campos.slice(0, 2).map((c) => (
              <div key={c.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{c.label}</label>
                <input
                  type={c.type}
                  name={c.name}
                  value={(form as any)[c.name]}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {erro[c.name] && <p className="text-red-500 text-xs mt-1">{erro[c.name]}</p>}
              </div>
            ))}
          </div>

          {campos.slice(2).map((c) => (
            <div key={c.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{c.label}</label>
              <input
                type={c.type}
                name={c.name}
                value={(form as any)[c.name]}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {erro[c.name] && <p className="text-red-500 text-xs mt-1">{Array.isArray(erro[c.name]) ? (erro[c.name] as any)[0] : erro[c.name]}</p>}
            </div>
          ))}

          {erro.geral && <p className="text-red-500 text-sm">{erro.geral}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
