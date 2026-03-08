export type VendaStatus = 'CONCLUIDA' | 'CANCELADA'
export type FormaPagamento = 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX'

export interface ItemVendaProps {
  id: string
  vendaId: string
  produtoId: string
  quantidade: number
  precoUnit: number
  subtotal: number
}

export interface VendaProps {
  id: string
  tenantId: string
  caixaId: string
  total: number
  desconto: number
  formaPagamento: FormaPagamento
  valorPago: number | null
  troco: number | null
  status: VendaStatus
  nfceChave: string | null
  createdAt: Date
  itens: ItemVendaProps[]
}

export interface ItemVendaInput {
  produtoId: string
  quantidade: number
  precoUnit: number
}

export interface CriarVendaInput {
  tenantId: string
  caixaId: string
  formaPagamento: FormaPagamento
  desconto?: number
  valorPago?: number
  itens: ItemVendaInput[]
}

export class Venda {
  constructor(public readonly props: VendaProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get caixaId() { return this.props.caixaId }
  get total() { return this.props.total }
  get desconto() { return this.props.desconto }
  get formaPagamento() { return this.props.formaPagamento }
  get valorPago() { return this.props.valorPago }
  get troco() { return this.props.troco }
  get status() { return this.props.status }
  get itens() { return this.props.itens }

  get estaCancelada(): boolean {
    return this.status === 'CANCELADA'
  }
}
