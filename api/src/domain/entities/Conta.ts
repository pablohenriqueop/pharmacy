export type TipoConta = 'PAGAR' | 'RECEBER'
export type StatusConta = 'PENDENTE' | 'PAGA' | 'CANCELADA'

export interface ContaProps {
  id: string
  tenantId: string
  tipo: TipoConta
  descricao: string
  valor: number
  categoria: string | null
  dataVencimento: Date
  dataPagamento: Date | null
  status: StatusConta
  createdAt: Date
  updatedAt: Date
}

export interface CriarContaInput {
  tenantId: string
  tipo: TipoConta
  descricao: string
  valor: number
  categoria?: string | null
  dataVencimento: Date
}

export interface FluxoCaixaItem {
  data: string
  entradas: number
  saidas: number
  saldo: number
}

export class Conta {
  constructor(public readonly props: ContaProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get tipo() { return this.props.tipo }
  get descricao() { return this.props.descricao }
  get valor() { return this.props.valor }
  get categoria() { return this.props.categoria }
  get dataVencimento() { return this.props.dataVencimento }
  get dataPagamento() { return this.props.dataPagamento }
  get status() { return this.props.status }

  get estaPaga(): boolean {
    return this.status === 'PAGA'
  }

  get estaVencida(): boolean {
    return this.status === 'PENDENTE' && this.dataVencimento < new Date()
  }
}
