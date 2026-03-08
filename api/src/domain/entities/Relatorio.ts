export interface VendaPorPeriodo {
  data: string
  totalVendas: number
  quantidadeVendas: number
  totalDesconto: number
  vendasPorFormaPagamento: Record<string, { quantidade: number; total: number }>
}

export interface ProdutoMaisVendido {
  produtoId: string
  nome: string
  categoria: string | null
  quantidadeVendida: number
  totalFaturado: number
}

export interface AlertaEstoque {
  produtoId: string
  nome: string
  categoria: string | null
  estoqueAtual: number
  estoqueMinimo: number
}

export interface FiltroRelatorio {
  dataInicio: Date
  dataFim: Date
}
