import Link from 'next/link'
import ProdutoCard from '@/components/produto/ProdutoCard'
import OrdenarSelect from '@/components/ui/OrdenarSelect'
import EmptyState from '@/components/ui/EmptyState'
import { Search, SlidersHorizontal, Star, Tag, X } from 'lucide-react'
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

  const activeFilters: { key: string; label: string }[] = []
  if (params.q) activeFilters.push({ key: 'q', label: `"${params.q}"` })
  if (params.categoria) {
    const cat = categorias.find((c) => c.slug === params.categoria)
    if (cat) activeFilters.push({ key: 'categoria', label: cat.nome })
  }
  if (params.destaque === 'true') activeFilters.push({ key: 'destaque', label: 'Destaques' })
  if (params.promocao === 'true') activeFilters.push({ key: 'promocao', label: 'Promoções' })

  function removeFilter(key: string) {
    const next = { ...params }
    delete next[key]
    return `/produtos${Object.keys(next).length ? `?${new URLSearchParams(next)}` : ''}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-4 py-3.5 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
              <h3 className="font-semibold text-neutral-800 text-sm">Filtros</h3>
            </div>

            <div className="p-4 space-y-6">
              {/* Categorias */}
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider mb-3">Categoria</p>
                <div className="space-y-0.5">
                  <Link
                    href="/produtos"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      !params.categoria ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>Todas</span>
                  </Link>
                  {categorias.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/produtos?categoria=${cat.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        params.categoria === cat.slug ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{cat.nome}</span>
                      {params.categoria === cat.slug && (
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Filtros rápidos */}
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider mb-3">Filtros Rápidos</p>
                <div className="space-y-0.5">
                  <Link
                    href={`/produtos?${new URLSearchParams({ ...params, destaque: 'true' })}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      params.destaque === 'true' ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    Destaques
                  </Link>
                  <Link
                    href={`/produtos?${new URLSearchParams({ ...params, promocao: 'true' })}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      params.promocao === 'true' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Promoções
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Conteúdo principal ───────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Barra de busca e ordenação */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <form className="flex-1 flex gap-2" method="GET" action="/produtos">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q}
                  placeholder="Buscar produto..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 bg-white"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2.5 rounded-xl text-sm"
              >
                Buscar
              </button>
            </form>

            <OrdenarSelect opcoes={ordenarOpcoes} valorAtual={params.ordenar || '-criado_em'} />
          </div>

          {/* Filtros ativos */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-xs text-neutral-400 font-medium">Filtros:</span>
              {activeFilters.map(({ key, label }) => (
                <Link
                  key={key}
                  href={removeFilter(key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  {label}
                  <X className="w-3 h-3" />
                </Link>
              ))}
              {activeFilters.length > 1 && (
                <Link href="/produtos" className="text-xs text-neutral-400 hover:text-red-500 transition-colors">
                  Limpar todos
                </Link>
              )}
            </div>
          )}

          {/* Contador */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-800">{count}</span>{' '}
              produto{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Grid de produtos */}
          {produtos.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum produto encontrado"
              description="Tente outros termos ou remova os filtros aplicados."
              cta={{ label: 'Ver todos os produtos', href: '/produtos' }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
