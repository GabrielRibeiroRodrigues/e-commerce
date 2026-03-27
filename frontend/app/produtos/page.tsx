import Link from 'next/link'
import ProdutoCard from '@/components/produto/ProdutoCard'
import OrdenarSelect from '@/components/ui/OrdenarSelect'
import type { PaginatedResponse, Produto, Categoria } from '@/types'

const API = process.env.API_URL || 'http://localhost:8000/api'

async function getProdutos(params: Record<string, string>): Promise<PaginatedResponse<Produto>> {
  const qs = new URLSearchParams(params).toString()
  try {
    const res = await fetch(`${API}/produtos/?${qs}`, { next: { revalidate: 30 } })
    if (!res.ok) return { count: 0, next: null, previous: null, results: [] }
    return res.json()
  } catch {
    return { count: 0, next: null, previous: null, results: [] }
  }
}

async function getCategorias(): Promise<Categoria[]> {
  try {
    const res = await fetch(`${API}/categorias/`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams
  const [{ results: produtos, count }, categorias] = await Promise.all([
    getProdutos(params),
    getCategorias(),
  ])

  const ordenarOpcoes = [
    { value: '-criado_em', label: 'Mais recentes' },
    { value: 'preco', label: 'Menor preço' },
    { value: '-preco', label: 'Maior preço' },
    { value: 'nome', label: 'Nome A-Z' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filtros */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Categorias</h3>
              <div className="space-y-1">
                <Link
                  href="/produtos"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!params.categoria ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Todas
                </Link>
                {categorias.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/produtos?categoria=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.categoria === cat.slug ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat.nome}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Filtros</h3>
              <div className="space-y-2">
                <Link
                  href={`/produtos?${new URLSearchParams({ ...params, destaque: 'true' })}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.destaque === 'true' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  ⭐ Destaques
                </Link>
                <Link
                  href={`/produtos?${new URLSearchParams({ ...params, promocao: 'true' })}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.promocao === 'true' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  🏷️ Promoções
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1">
          {/* Barra de busca e ordenação */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form className="flex-1 flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Buscar produto..."
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </form>

            <OrdenarSelect opcoes={ordenarOpcoes} valorAtual={params.ordenar || '-criado_em'} />
          </div>

          <p className="text-sm text-gray-500 mb-4">{count} produto{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}</p>

          {produtos.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Nenhum produto encontrado.</p>
              <Link href="/produtos" className="text-blue-600 text-sm mt-2 inline-block hover:underline">Limpar filtros</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtos.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
