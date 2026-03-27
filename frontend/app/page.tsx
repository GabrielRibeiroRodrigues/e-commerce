import Link from 'next/link'
import ProdutoCard from '@/components/produto/ProdutoCard'
import type { HomeData } from '@/types'

async function getHomeData(): Promise<HomeData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/home/`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return { destaques: [], promocoes: [] }
  return res.json()
}

export default async function HomePage() {
  const { destaques, promocoes } = await getHomeData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-10 text-white text-center">
        <h1 className="text-4xl font-bold mb-3">Farmácia QUEOPS</h1>
        <p className="text-blue-100 text-lg mb-6">Saúde e bem-estar com os melhores preços</p>
        <Link
          href="/produtos"
          className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Ver todos os produtos
        </Link>
      </section>

      {/* Destaques */}
      {destaques.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Produtos em Destaque</h2>
            <Link href="/produtos?destaque=true" className="text-blue-600 text-sm hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {destaques.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}

      {/* Promoções */}
      {promocoes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Promoções</h2>
            <Link href="/produtos?promocao=true" className="text-blue-600 text-sm hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {promocoes.map((p) => (
              <ProdutoCard key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
