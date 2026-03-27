import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Estrelas from '@/components/ui/Estrelas'

describe('Estrelas', () => {
  it('renderiza 5 estrelas', () => {
    render(<Estrelas media={4} total={10} />)
    const estrelas = document.querySelectorAll('svg')
    expect(estrelas.length).toBe(5)
  })

  it('exibe total de avaliações', () => {
    render(<Estrelas media={3} total={42} />)
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })

  it('marca as estrelas preenchidas corretamente', () => {
    render(<Estrelas media={3} total={5} />)
    const estrelas = document.querySelectorAll('svg')
    // 3 preenchidas (text-yellow-400), 2 vazias (text-gray-300)
    const preenchidas = Array.from(estrelas).filter((s) =>
      s.classList.contains('text-yellow-400')
    )
    expect(preenchidas.length).toBe(3)
  })

  it('sem estrelas preenchidas quando media é 0', () => {
    render(<Estrelas media={0} total={0} />)
    const estrelas = document.querySelectorAll('svg')
    const preenchidas = Array.from(estrelas).filter((s) =>
      s.classList.contains('text-yellow-400')
    )
    expect(preenchidas.length).toBe(0)
  })
})
