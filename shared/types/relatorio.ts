export interface FiltroRelatorioRequest {
  dataInicio: string
  dataFim: string
}

export interface VendaPorPeriodoResponse {
  data: string
  totalVendas: number
  quantidadeVendas: number
  totalDesconto: number
  vendasPorFormaPagamento: Record<string, { quantidade: number; total: number }>
}

export interface ProdutoMaisVendidoResponse {
  produtoId: string
  nome: string
  categoria: string | null
  quantidadeVendida: number
  totalFaturado: number
}

export interface AlertaEstoqueResponse {
  produtoId: string
  nome: string
  categoria: string | null
  estoqueAtual: number
  estoqueMinimo: number
}
