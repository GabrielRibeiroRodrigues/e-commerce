export interface Categoria {
  id: number
  nome: string
  slug: string
  descricao: string
}

export interface Produto {
  id: number
  nome: string
  slug: string
  preco: string
  preco_promocional: string | null
  preco_final: string
  tem_promocao: boolean
  disponivel: boolean
  estoque: number
  destaque: boolean
  categoria: Categoria
  imagem_url: string | null
  media_avaliacoes: number
  total_avaliacoes: number
  descricao?: string
  avaliacoes?: Avaliacao[]
  usuario_ja_avaliou?: boolean
  criado_em?: string
}

export interface Avaliacao {
  id: number
  usuario_nome: string
  usuario_username: string
  rating: number
  comentario: string
  criado_em: string
}

export interface CarrinhoItem {
  id: number
  produto: Produto
  quantidade: number
  subtotal: string
}

export interface Carrinho {
  itens: CarrinhoItem[]
  total: string
  quantidade_total: number
}

export interface ItemPedido {
  id: number
  produto_nome: string
  produto_slug: string
  quantidade: number
  preco_unitario: string
  subtotal: string
}

export interface Pagamento {
  id: number
  metodo: string
  metodo_display: string
  status: string
  status_display: string
  valor: string
  transacao_id: string
  codigo_confirmacao: string
  mensagem_retorno: string
  cartao_final: string
  nome_portador: string
  criado_em: string
}

export interface Pedido {
  id: number
  status: string
  status_display: string
  total: string
  valor_frete: string
  total_com_frete: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  itens: ItemPedido[]
  pagamento: Pagamento
  criado_em: string
}

export interface Perfil {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

export interface ListaDesejo {
  id: number
  produto: Produto
  criado_em: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface HomeData {
  destaques: Produto[]
  promocoes: Produto[]
}

export interface CheckoutData {
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  metodo_pagamento: 'cartao_credito' | 'pix' | 'boleto'
  numero_cartao?: string
  nome_portador?: string
  validade?: string
  cvv?: string
}
