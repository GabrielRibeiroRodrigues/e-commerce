'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCarrinho } from '@/store/carrinho'
import { useEffect } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const { carrinho, fetchCarrinho } = useCarrinho()

  useEffect(() => {
    if (session) fetchCarrinho()
  }, [session])

  const qtd = carrinho?.quantidade_total ?? 0

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Farmácia QUEOPS
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/produtos" className="text-gray-600 hover:text-blue-600 transition-colors">
              Produtos
            </Link>
            {session && (
              <>
                <Link href="/pedidos" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Meus Pedidos
                </Link>
                <Link href="/desejos" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Lista de Desejos
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/perfil"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {session.user?.name}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cadastrar
                </Link>
              </>
            )}

            <Link href="/carrinho" className="relative p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {qtd > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {qtd}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
