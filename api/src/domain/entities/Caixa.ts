export type CaixaStatus = 'ABERTO' | 'FECHADO'

export interface CaixaProps {
  id: string
  tenantId: string
  valorAbertura: number
  valorFechamento: number | null
  aberturaEm: Date
  fechamentoEm: Date | null
  status: CaixaStatus
}

export interface AbrirCaixaInput {
  tenantId: string
  valorAbertura: number
}

export class Caixa {
  constructor(public readonly props: CaixaProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get valorAbertura() { return this.props.valorAbertura }
  get valorFechamento() { return this.props.valorFechamento }
  get aberturaEm() { return this.props.aberturaEm }
  get fechamentoEm() { return this.props.fechamentoEm }
  get status() { return this.props.status }

  get estaAberto(): boolean {
    return this.status === 'ABERTO'
  }
}
