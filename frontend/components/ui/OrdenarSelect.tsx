'use client'

import { ArrowUpDown } from 'lucide-react'

interface Opcao {
  value: string
  label: string
}

interface Props {
  opcoes: Opcao[]
  valorAtual: string
}

export default function OrdenarSelect({ opcoes, valorAtual }: Props) {
  return (
    <div className="relative">
      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
      <select
        defaultValue={valorAtual}
        onChange={(e) => {
          const url = new URL(window.location.href)
          url.searchParams.set('ordenar', e.target.value)
          window.location.href = url.toString()
        }}
        className="pl-8 pr-8 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 bg-white appearance-none font-medium text-neutral-700 cursor-pointer"
      >
        {opcoes.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
