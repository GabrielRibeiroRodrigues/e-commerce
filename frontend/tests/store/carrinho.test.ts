import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCarrinho } from '@/store/carrinho'
import type { Carrinho } from '@/types'

// Mock do módulo api
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const CARRINHO_MOCK: Carrinho = {
  itens: [
    {
      id: 1,
      produto: {
        id: 1, nome: 'Dipirona', slug: 'dipirona', preco: '10.00', preco_promocional: null,
        preco_final: '10.00', tem_promocao: false, disponivel: true, estoque: 5,
        destaque: false, categoria: { id: 1, nome: 'Medicamentos', slug: 'medicamentos', descricao: '' },
        imagem_url: null, media_avaliacoes: 0, total_avaliacoes: 0,
      },
      quantidade: 2,
      subtotal: '20.00',
    },
  ],
  total: '20.00',
  quantidade_total: 2,
}

describe('useCarrinho store', () => {
  beforeEach(() => {
    useCarrinho.setState({ carrinho: null, loading: false })
  })

  it('estado inicial é null', () => {
    const { carrinho } = useCarrinho.getState()
    expect(carrinho).toBeNull()
  })

  it('fetchCarrinho atualiza o estado', async () => {
    const api = (await import('@/lib/api')).default
    vi.mocked(api.get).mockResolvedValueOnce({ data: CARRINHO_MOCK })

    await useCarrinho.getState().fetchCarrinho()

    const { carrinho } = useCarrinho.getState()
    expect(carrinho).not.toBeNull()
    expect(carrinho?.quantidade_total).toBe(2)
    expect(carrinho?.total).toBe('20.00')
  })

  it('fetchCarrinho define null em caso de erro', async () => {
    const api = (await import('@/lib/api')).default
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'))

    await useCarrinho.getState().fetchCarrinho()

    expect(useCarrinho.getState().carrinho).toBeNull()
  })

  it('limpar zera o carrinho', () => {
    useCarrinho.setState({ carrinho: CARRINHO_MOCK })
    useCarrinho.getState().limpar()
    expect(useCarrinho.getState().carrinho).toBeNull()
  })

  it('adicionarItem chama POST e faz fetch', async () => {
    const api = (await import('@/lib/api')).default
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} })
    vi.mocked(api.get).mockResolvedValueOnce({ data: CARRINHO_MOCK })

    await useCarrinho.getState().adicionarItem(1, 2)

    expect(api.post).toHaveBeenCalledWith('/carrinho/', { produto_id: 1, quantidade: 2 })
    expect(api.get).toHaveBeenCalledWith('/carrinho/')
  })

  it('removerItem chama DELETE e faz fetch', async () => {
    const api = (await import('@/lib/api')).default
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} })
    vi.mocked(api.get).mockResolvedValueOnce({ data: { ...CARRINHO_MOCK, itens: [], quantidade_total: 0 } })

    await useCarrinho.getState().removerItem(1)

    expect(api.delete).toHaveBeenCalledWith('/carrinho/1/')
  })
})
