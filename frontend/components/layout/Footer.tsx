import Link from 'next/link'
import { Pill, Phone, Mail, MapPin, Shield, Lock, CreditCard, Truck } from 'lucide-react'

const links = {
  institucional: [
    { href: '/sobre', label: 'Sobre a QUEOPS' },
    { href: '/produtos', label: 'Nossos Produtos' },
    { href: '/lgpd', label: 'Política de Privacidade' },
    { href: '/lgpd', label: 'Portal LGPD' },
  ],
  ajuda: [
    { href: '/pedidos', label: 'Meus Pedidos' },
    { href: '/faq', label: 'Perguntas Frequentes' },
    { href: '/trocas', label: 'Trocas e Devoluções' },
    { href: '/contato', label: 'Fale Conosco' },
  ],
  categorias: [
    { href: '/produtos?categoria=medicamentos', label: 'Medicamentos' },
    { href: '/produtos?categoria=dermocosmeticos', label: 'Dermocosméticos' },
    { href: '/produtos?categoria=vitaminas', label: 'Vitaminas e Suplementos' },
    { href: '/produtos?categoria=higiene', label: 'Higiene Pessoal' },
  ],
}

const selos = [
  { icon: Shield, label: 'Site Seguro SSL' },
  { icon: Lock, label: 'Dados Protegidos' },
  { icon: CreditCard, label: 'Pagamento Seguro' },
  { icon: Truck, label: 'Entrega Garantida' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Selos de segurança */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {selos.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-900 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <span className="text-sm font-medium text-neutral-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Coluna 1 — Marca */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-none block">QUEOPS</span>
                <span className="text-brand-400 text-[10px] font-medium tracking-widest uppercase">Farmácia</span>
              </div>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-5">
              Sua saúde em primeiro lugar. Medicamentos, dermocosméticos e suplementos com qualidade e os melhores preços.
            </p>

            {/* Redes sociais */}
            <div className="flex gap-3">
              {[
                { label: 'Instagram', href: '#', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                { label: 'Facebook', href: '#', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { label: 'WhatsApp', href: '#', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' },
              ].map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-neutral-800 hover:bg-brand-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 2 — Institucional */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Institucional</h3>
            <ul className="space-y-2.5">
              {links.institucional.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-neutral-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Ajuda */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Ajuda</h3>
            <ul className="space-y-2.5">
              {links.ajuda.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-neutral-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4 — Contato */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contato</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-neutral-300">(11) 3000-0000</p>
                  <p className="text-xs text-neutral-500">Seg–Sex, 8h–18h</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <p className="text-sm text-neutral-300">sac@queops.com.br</p>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-neutral-300">São Paulo, SP</p>
                  <p className="text-xs text-neutral-500">Entregamos para todo o Brasil</p>
                </div>
              </li>
            </ul>

            {/* Formas de pagamento */}
            <div className="mt-5">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Formas de pagamento</p>
              <div className="flex gap-2 flex-wrap">
                {['PIX', 'Boleto', 'Visa', 'Master'].map((m) => (
                  <span key={m} className="px-2.5 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md font-medium border border-neutral-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé final */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-neutral-500">
            <p>© {year} Farmácia QUEOPS. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <span>CNPJ: 00.000.000/0001-00</span>
              <span>·</span>
              <span>CRF: 00000-SP</span>
              <span>·</span>
              <Link href="/lgpd" className="hover:text-brand-400 transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
