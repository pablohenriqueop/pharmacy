export interface ProdutoProps {
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
  createdAt: Date
  updatedAt: Date
}

export interface CriarProdutoInput {
  tenantId: string
  nome: string
  codigoBarras?: string | null
  categoria?: string | null
  precoVenda: number
  precoCusto?: number | null
  unidade?: string
  estoqueAtual?: number
  estoqueMinimo?: number
}

export interface AtualizarProdutoInput {
  nome?: string
  codigoBarras?: string | null
  categoria?: string | null
  precoVenda?: number
  precoCusto?: number | null
  unidade?: string
  estoqueAtual?: number
  estoqueMinimo?: number
  ativo?: boolean
}

export class Produto {
  constructor(public readonly props: ProdutoProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get nome() { return this.props.nome }
  get codigoBarras() { return this.props.codigoBarras }
  get categoria() { return this.props.categoria }
  get precoVenda() { return this.props.precoVenda }
  get precoCusto() { return this.props.precoCusto }
  get unidade() { return this.props.unidade }
  get estoqueAtual() { return this.props.estoqueAtual }
  get estoqueMinimo() { return this.props.estoqueMinimo }
  get ativo() { return this.props.ativo }

  get estoqueBaixo(): boolean {
    return this.estoqueAtual <= this.estoqueMinimo
  }
}
