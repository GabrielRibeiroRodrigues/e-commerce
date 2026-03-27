import Link from 'next/link'
import ProdutoCard from '@/components/produto/ProdutoCard'
import {
  Truck, Shield, Clock, Headphones,
  ArrowRight, Star, Package,
  Pill, Heart, Sparkles, Baby, Dumbbell, Thermometer,
} from 'lucide-react'
import type { HomeData } from '@/types'

const API_URL = process.env.API_URL || 'http://localhost:8000/api'

async function getHomeData(): Promise<HomeData> {
  try {
    const res = await fetch(`${API_URL}/home/`, { next: { revalidate: 60 } })
    if (!res.ok) return { destaques: [], promocoes: [] }
    return res.json()
  } catch {
    return { destaques: [], promocoes: [] }
  }
}

const categorias = [
  { icon: Pill, label: 'Medicamentos', slug: 'medicamentos', cor: 'bg-blue-50 text-blue-600' },
  { icon: Sparkles, label: 'Dermocosmético', slug: 'dermocosmeticos', cor: 'bg-pink-50 text-pink-600' },
  { icon: Heart, label: 'Vitaminas', slug: 'vitaminas', cor: 'bg-red-50 text-red-500' },
  { icon: Baby, label: 'Infantil', slug: 'infantil', cor: 'bg-yellow-50 text-yellow-600' },
  { icon: Dumbbell, label: 'Suplementos', slug: 'suplementos', cor: 'bg-orange-50 text-orange-600' },
  { icon: Thermometer, label: 'Saúde em Casa', slug: 'saude', cor: 'bg-brand-50 text-brand-700' },
]

const diferenciais = [
  {
    icon: Truck,
    title: 'Entrega Rápida',
    desc: 'Frete grátis acima de R$ 150. Entregamos em todo o Brasil em até 5 dias úteis.',
    cor: 'text-brand-600 bg-brand-50',
  },
  {
    icon: Shield,
    title: 'Compra Segura',
    desc: 'Site criptografado com SSL. Seus dados e pagamento 100% protegidos.',
    cor: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Clock,
    title: 'Atendimento Ágil',
    desc: 'Suporte por telefone, e-mail e WhatsApp de segunda a sexta, das 8h às 18h.',
    cor: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Headphones,
    title: 'Pós-venda',
    desc: 'Garantia em todos os produtos. Troca ou devolução em até 7 dias após o recebimento.',
    cor: 'text-purple-600 bg-purple-50',
  },
]

export default async function HomePage() {
  const { destaques, promocoes } = await getHomeData()

  return (
    <div className="space-y-16 pb-16">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-teal-500">
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-16 w-48 h-48 rounded-full border-[40px] border-white" />
          <div className="absolute top-32 left-48 w-24 h-24 rounded-full border-[20px] border-white" />
          <div className="absolute bottom-8 right-16 w-64 h-64 rounded-full border-[50px] border-white" />
          <div className="absolute -bottom-10 right-48 w-32 h-32 rounded-full border-[25px] border-white" />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-80 h-80 rounded-full border-[60px] border-white opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/30">
              <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
              A farmácia mais completa do Brasil
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Saúde e bem-estar{' '}
              <span className="text-brand-200">ao seu alcance</span>
            </h1>
            <p className="text-brand-100 text-lg leading-relaxed mb-8 max-w-xl">
              Medicamentos, dermocosméticos, suplementos e muito mais. Entregamos em todo o Brasil com segurança e agilidade.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-brand-50 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Ver produtos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/produtos?promocao=true"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/30 hover:bg-white/25 transition-all"
              >
                Ver promoções
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/20">
              {[
                { val: '10.000+', label: 'Clientes satisfeitos' },
                { val: '5.000+', label: 'Produtos disponíveis' },
                { val: '4.9★', label: 'Avaliação média' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-brand-200 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* ── Categorias ───────────────────────────────── */}
        <section className="animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="section-title">Explorar por categoria</h2>
              <p className="text-sm text-neutral-500 mt-1">Encontre o que você precisa rapidamente</p>
            </div>
            <Link href="/produtos" className="hidden sm:flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categorias.map(({ icon: Icon, label, slug, cor }) => (
              <Link
                key={slug}
                href={`/produtos?categoria=${slug}`}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-brand-200 hover:shadow-md transition-all group text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-neutral-600 group-hover:text-brand-700 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Promoções ────────────────────────────────── */}
        {promocoes.length > 0 && (
          <section className="animate-slide-up delay-150">
            <div className="flex items-center justify-between mb-7">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 bg-accent-100 text-accent-600 text-xs font-bold px-3 py-1 rounded-full">
                    🔥 Tempo limitado
                  </span>
                </div>
                <h2 className="section-title">Ofertas Especiais</h2>
              </div>
              <Link href="/produtos?promocao=true" className="hidden sm:flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-semibold">
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {promocoes.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Destaques ────────────────────────────────── */}
        {destaques.length > 0 && (
          <section className="animate-slide-up delay-200">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="section-title">Produtos em Destaque</h2>
                <p className="text-sm text-neutral-500 mt-1">Os mais queridos pelos nossos clientes</p>
              </div>
              <Link href="/produtos?destaque=true" className="hidden sm:flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-semibold">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {destaques.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Banner promoção CTA ───────────────────────── */}
        <section className="animate-slide-up delay-200">
          <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
            <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-brand-600/20 to-transparent" />
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full border-[40px] border-brand-600/10" />

            <div className="flex-1 text-center lg:text-left">
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-2">🎁 Cadastre-se agora</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                10% OFF na primeira compra
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
                Crie sua conta grátis e receba um cupom exclusivo de desconto para usar na sua primeira compra na QUEOPS.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link href="/registro" className="btn btn-primary btn-lg shadow-lg shadow-brand-900/30">
                Criar conta grátis
              </Link>
              <Link href="/produtos" className="btn border border-neutral-600 text-neutral-300 hover:bg-neutral-700 px-7 py-3.5 rounded-2xl font-semibold">
                Ver produtos
              </Link>
            </div>
          </div>
        </section>

        {/* ── Diferenciais ─────────────────────────────── */}
        <section className="animate-slide-up delay-300">
          <h2 className="section-title text-center mb-2">Por que escolher a QUEOPS?</h2>
          <p className="text-center text-neutral-500 text-sm mb-10">Confiança, qualidade e cuidado em cada entrega</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {diferenciais.map(({ icon: Icon, title, desc, cor }) => (
              <div key={title} className="card card-hover p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cor} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-neutral-800 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Newsletter ───────────────────────────────── */}
        <section className="animate-slide-up delay-400">
          <div className="bg-brand-50 rounded-3xl border border-brand-100 p-8 text-center">
            <Package className="w-10 h-10 text-brand-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-800 mb-2">Receba nossas novidades</h3>
            <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
              Assine nossa newsletter e fique por dentro das últimas ofertas, lançamentos e dicas de saúde.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="#">
              <input
                type="email"
                name="email"
                placeholder="seu@email.com.br"
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary px-6 py-2.5 rounded-xl whitespace-nowrap">
                Assinar
              </button>
            </form>
            <p className="text-xs text-neutral-400 mt-3">Sem spam. Cancele quando quiser.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
