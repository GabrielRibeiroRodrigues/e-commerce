import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-6" aria-label="Breadcrumb">
      <Link href="/" className="text-neutral-400 hover:text-brand-600 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="text-neutral-400 hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
