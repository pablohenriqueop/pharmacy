export interface ProdutoResponse {
  id: string
  tenantId: string
  nome: string
  codigoBarras: string | null
  categoria: string | null
  precoVenda: number
  precoCusto: number | null
  unidade: string
  estoqueAtual: number
  estoqueMinimo: number
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface CriarProdutoRequest {
  nome: string
  precoVenda: number
  codigoBarras?: string
  categoria?: string
  precoCusto?: number
  unidade?: string
  estoqueAtual?: number
  estoqueMinimo?: number
}

export interface AtualizarProdutoRequest {
  nome?: string
  precoVenda?: number
  precoCusto?: number
  codigoBarras?: string
  categoria?: string
  unidade?: string
  estoqueAtual?: number
  estoqueMinimo?: number
}
