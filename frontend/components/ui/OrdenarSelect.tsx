'use client'

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
    <select
      defaultValue={valorAtual}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('ordenar', e.target.value)
        window.location.href = url.toString()
      }}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {opcoes.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
