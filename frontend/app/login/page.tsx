'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pill, Eye, EyeOff, AlertCircle, Lock, User, ArrowRight, ShieldCheck, Truck, Star } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const res = await signIn('credentials', { username, password, redirect: false })
    setLoading(false)
    if (res?.ok) {
      router.push('/')
    } else {
      setErro('Usuário ou senha incorretos. Tente novamente.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex">
      {/* ── Painel esquerdo — marca ──────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-br from-brand-700 via-brand-600 to-teal-500 p-12 relative overflow-hidden">
        {/* Decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full border-[30px] border-white" />
          <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full border-[50px] border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-[60px] border-white opacity-20" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">QUEOPS</p>
            <p className="text-brand-200 text-xs tracking-widest uppercase">Farmácia</p>
          </div>
        </div>

        {/* Conteúdo central */}
        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Sua saúde<br />em boas mãos
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed mb-8">
            Acesse sua conta e aproveite os melhores preços em medicamentos e produtos de saúde.
          </p>
          <div className="space-y-4">
            {[
              { icon: ShieldCheck, text: 'Compras 100% seguras e protegidas' },
              { icon: Truck, text: 'Entrega rápida em todo o Brasil' },
              { icon: Star, text: 'Mais de 10 mil clientes satisfeitos' },
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

        {/* Footer brand */}
        <p className="relative text-brand-300 text-xs">
          © {new Date().getFullYear()} Farmácia QUEOPS
        </p>
      </div>

      {/* ── Painel direito — formulário ──────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-brand-700 text-lg">QUEOPS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Bem-vindo de volta</h1>
            <p className="text-neutral-500 text-sm">Entre com sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Usuário</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="seu.usuario"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-neutral-700">Senha</label>
                <Link href="#" className="text-xs text-brand-600 hover:underline font-medium">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {erro}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-neutral-500 text-center mt-6">
            Não tem conta?{' '}
            <Link href="/registro" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
              Criar conta grátis
            </Link>
          </p>

          {/* Segurança */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Seus dados estão protegidos
          </div>
        </div>
      </div>
    </div>
  )
}
