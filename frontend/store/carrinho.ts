import { create } from 'zustand'
import api from '@/lib/api'
import type { Carrinho, CarrinhoItem } from '@/types'

interface CarrinhoState {
  carrinho: Carrinho | null
  loading: boolean
  fetchCarrinho: () => Promise<void>
  adicionarItem: (produto_id: number, quantidade?: number) => Promise<void>
  atualizarItem: (produto_id: number, quantidade: number) => Promise<void>
  removerItem: (produto_id: number) => Promise<void>
  limpar: () => void
}

export const useCarrinho = create<CarrinhoState>((set, get) => ({
  carrinho: null,
  loading: false,

  fetchCarrinho: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<Carrinho>('/carrinho/')
      set({ carrinho: data })
    } catch {
      set({ carrinho: null })
    } finally {
      set({ loading: false })
    }
  },

  adicionarItem: async (produto_id, quantidade = 1) => {
    await api.post('/carrinho/', { produto_id, quantidade })
    await get().fetchCarrinho()
  },

  atualizarItem: async (produto_id, quantidade) => {
    await api.put(`/carrinho/${produto_id}/`, { quantidade })
    await get().fetchCarrinho()
  },

  removerItem: async (produto_id) => {
    await api.delete(`/carrinho/${produto_id}/`)
    await get().fetchCarrinho()
  },

  limpar: () => set({ carrinho: null }),
}))
