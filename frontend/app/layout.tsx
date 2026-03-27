import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Farmácia QUEOPS — Saúde e Bem-estar',
    template: '%s | Farmácia QUEOPS',
  },
  description: 'Medicamentos, dermocosméticos e produtos de saúde com os melhores preços. Entrega rápida em todo o Brasil.',
  keywords: ['farmácia', 'medicamentos', 'saúde', 'bem-estar', 'cosméticos', 'entrega'],
  authors: [{ name: 'Farmácia QUEOPS' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Farmácia QUEOPS',
    title: 'Farmácia QUEOPS — Saúde e Bem-estar',
    description: 'Medicamentos e produtos de saúde com os melhores preços.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="bg-neutral-50 min-h-screen flex flex-col antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
