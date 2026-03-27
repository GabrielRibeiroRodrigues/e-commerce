'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Pill, Eye, EyeOff, AlertCircle, ShieldCheck, Truck, Star,
  ArrowRight, User, Mail, Lock,
} from 'lucide-react'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['', 'Fraca', 'Regular', 'Boa', 'Forte']
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-brand-400', 'bg-emerald-500']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-neutral-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-neutral-400">
        Força da senha: <span className={score >= 3 ? 'text-emerald-600 font-semibold' : score === 2 ? 'text-amber-600 font-semibold' : 'text-red-500 font-semibold'}>
          {labels[score] || 'Muito fraca'}
        </span>
      </p>
    </div>
  )
}

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  })
  const [erro, setErro] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro({})

    if (form.password !== form.password2) {
      setErro({ password2: 'As senhas não coincidem.' })
      return
    }

    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/registro/`, form)
      await signIn('credentials', { username: form.username, password: form.password, redirect: false })
      router.push('/')
    } catch (err: any) {
      setErro(err.response?.data || { geral: 'Erro ao criar conta. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex">
      {/* ── Painel esquerdo — marca ──────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-br from-brand-700 via-brand-600 to-teal-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full border-[30px] border-white" />
          <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full border-[50px] border-white" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">QUEOPS</p>
            <p className="text-brand-200 text-xs tracking-widest uppercase">Farmácia</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Crie sua conta<br />e comece agora
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed mb-8">
            Cadastre-se gratuitamente e tenha acesso a preços exclusivos, histórico de pedidos e muito mais.
          </p>
          <div className="space-y-4">
            {[
              { icon: ShieldCheck, text: 'Dados protegidos com criptografia SSL' },
              { icon: Truck, text: 'Frete grátis acima de R$ 150' },
              { icon: Star, text: '10% OFF na primeira compra' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-brand-100 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-brand-300 text-xs">© {new Date().getFullYear()} Farmácia QUEOPS</p>
      </div>

      {/* ── Painel direito — formulário ──────────────────── */}
      <div className="flex-1 flex items-start justify-center px-4 py-10 overflow-y-auto">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-brand-700 text-lg">QUEOPS</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Criar conta</h1>
            <p className="text-neutral-500 text-sm">Preencha os dados para se cadastrar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nome</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="João"
                  className="input"
                />
                {erro.first_name && <p className="text-red-500 text-xs mt-1">{erro.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Sobrenome</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Silva"
                  className="input"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Usuário</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="joao.silva"
                  className="input pl-10"
                />
              </div>
              {erro.username && (
                <p className="text-red-500 text-xs mt-1">
                  {Array.isArray(erro.username) ? erro.username[0] : erro.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="joao@email.com"
                  className="input pl-10"
                />
              </div>
              {erro.email && (
                <p className="text-red-500 text-xs mt-1">
                  {Array.isArray(erro.email) ? erro.email[0] : erro.email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {erro.password && (
                <p className="text-red-500 text-xs mt-1">
                  {Array.isArray(erro.password) ? erro.password[0] : erro.password}
                </p>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  name="password2"
                  type={showPass ? 'text' : 'password'}
                  value={form.password2}
                  onChange={handleChange}
                  required
                  placeholder="Repita a senha"
                  className={`input pl-10 ${form.password2 && form.password2 !== form.password ? 'border-red-300' : form.password2 && form.password2 === form.password ? 'border-emerald-400' : ''}`}
                />
              </div>
              {erro.password2 && <p className="text-red-500 text-xs mt-1">{erro.password2}</p>}
            </div>

            {/* Erro geral */}
            {erro.geral && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {erro.geral}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                <>
                  Criar conta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-neutral-400 text-center mt-4">
            Ao criar conta, você concorda com nossa{' '}
            <Link href="/lgpd" className="text-brand-600 hover:underline">Política de Privacidade</Link>
          </p>

          <p className="text-sm text-neutral-500 text-center mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
