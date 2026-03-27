'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCarrinho } from '@/store/carrinho'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Package,
  ChevronDown,
  Pill,
} from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()
  const { carrinho, fetchCarrinho } = useCarrinho()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (session) fetchCarrinho()
  }, [session])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  // Fecha menu mobile ao navegar
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [router])

  // Bloqueia scroll quando menu mobile aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const qtd = carrinho?.quantidade_total ?? 0

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const userName = session?.user?.name?.split(' ')[0] ?? 'Conta'

  return (
    <>
      <header
        className={`bg-white sticky top-0 z-50 transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : 'border-b border-neutral-200'
        }`}
      >
        {/* Barra superior — promoção */}
        <div className="bg-brand-700 text-white text-center py-2 text-xs font-medium tracking-wide">
          🚚 Frete grátis em compras acima de R$ 150,00 — Entregamos em todo o Brasil
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
                <Pill className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-brand-700 leading-none block">QUEOPS</span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase leading-none">Farmácia</span>
              </div>
            </Link>

            {/* Barra de busca — desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar medicamentos, cosméticos..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm bg-neutral-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                />
              </div>
            </form>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/produtos"
                className="px-3 py-2 text-sm text-neutral-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors font-medium"
              >
                Produtos
              </Link>

              {session ? (
                <>
                  <Link
                    href="/pedidos"
                    className="px-3 py-2 text-sm text-neutral-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                  >
                    <Package className="w-4 h-4" />
                    Pedidos
                  </Link>
                  <Link
                    href="/desejos"
                    className="relative p-2.5 text-neutral-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Lista de desejos"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                </>
              ) : null}
            </nav>

            {/* Ações direita */}
            <div className="flex items-center gap-1">
              {/* Busca mobile */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2.5 text-neutral-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Carrinho */}
              <Link
                href="/carrinho"
                className="relative p-2.5 text-neutral-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                title="Carrinho"
              >
                <ShoppingCart className="w-5 h-5" />
                {qtd > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] h-[18px] px-1">
                    {qtd > 9 ? '9+' : qtd}
                  </span>
                )}
              </Link>

              {/* Usuário */}
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="hidden md:flex items-center gap-1.5 pl-2 pr-3 py-2 text-sm text-neutral-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors font-medium"
                  >
                    <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    {userName}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-neutral-200 shadow-xl py-1.5 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="text-xs text-neutral-400">Conectado como</p>
                        <p className="text-sm font-semibold text-neutral-800 truncate">{session.user?.name}</p>
                      </div>
                      <Link
                        href="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-brand-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        href="/pedidos"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-brand-700 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        Meus Pedidos
                      </Link>
                      <Link
                        href="/desejos"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-brand-700 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Lista de Desejos
                      </Link>
                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm text-neutral-600 hover:text-brand-700 rounded-lg transition-colors font-medium"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registro"
                    className="btn btn-primary btn-sm text-sm"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}

              {/* Hamburger mobile */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden p-2.5 text-neutral-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Overlay de busca mobile ───────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start pt-20 px-4" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm bg-white shadow-xl outline-none border-2 border-brand-400"
                />
              </div>
              <button type="submit" className="btn btn-primary px-4 py-3 rounded-xl">
                Buscar
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="p-3.5 bg-white rounded-xl shadow-xl text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Drawer mobile ────────────────────────────────── */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header do drawer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-brand-700">QUEOPS</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Usuário */}
            {session ? (
              <div className="px-5 py-4 bg-brand-50 border-b border-brand-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-200 rounded-full flex items-center justify-center text-brand-800 font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900 text-sm">{session.user?.name}</p>
                    <p className="text-xs text-brand-600">{session.user?.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 bg-brand-50 border-b border-brand-100 flex gap-3">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 border border-brand-300 text-brand-700 rounded-lg text-sm font-semibold">
                  Entrar
                </Link>
                <Link href="/registro" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold">
                  Cadastrar
                </Link>
              </div>
            )}

            {/* Links */}
            <nav className="flex-1 overflow-y-auto py-4">
              {[
                { href: '/produtos', label: 'Produtos', icon: Search },
                ...(session ? [
                  { href: '/pedidos', label: 'Meus Pedidos', icon: Package },
                  { href: '/desejos', label: 'Lista de Desejos', icon: Heart },
                  { href: '/perfil', label: 'Meu Perfil', icon: User },
                ] : []),
                { href: '/carrinho', label: 'Carrinho', icon: ShoppingCart, badge: qtd > 0 ? qtd : undefined },
              ].map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-neutral-700 hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
                >
                  <Icon className="w-5 h-5 text-neutral-400" />
                  {label}
                  {badge !== undefined && (
                    <span className="ml-auto bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Sair */}
            {session && (
              <div className="border-t border-neutral-100 p-5">
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="flex items-center gap-2 text-red-500 text-sm font-medium w-full hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
