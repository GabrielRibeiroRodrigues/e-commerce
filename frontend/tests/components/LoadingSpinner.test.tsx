import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renderiza o spinner', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('aplica className extra', () => {
    const { container } = render(<LoadingSpinner className="py-20" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.classList.contains('py-20')).toBe(true)
  })
})
