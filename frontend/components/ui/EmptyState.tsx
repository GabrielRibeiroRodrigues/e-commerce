import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  cta?: {
    label: string
    href: string
  }
}

export default function EmptyState({ icon: Icon, title, description, cta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-brand-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-neutral-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-neutral-400 max-w-sm mb-6">{description}</p>}
      {cta && (
        <Link href={cta.href} className="btn btn-primary">
          {cta.label}
        </Link>
      )}
    </div>
  )
}
