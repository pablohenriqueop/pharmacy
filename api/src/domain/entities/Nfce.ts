export type NfceStatus = 'AUTORIZADA' | 'CANCELADA' | 'REJEITADA' | 'PENDENTE'

export interface NfceProps {
  id: string
  tenantId: string
  vendaId: string
  chave: string
  numero: number
  serie: number
  xml: string
  protocolo: string
  status: NfceStatus
  motivoCancelamento: string | null
  createdAt: Date
}

export interface EmitirNfceInput {
  tenantId: string
  vendaId: string
}

export interface CancelarNfceInput {
  tenantId: string
  nfceId: string
  motivo: string
}

export class Nfce {
  constructor(public readonly props: NfceProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get vendaId() { return this.props.vendaId }
  get chave() { return this.props.chave }
  get numero() { return this.props.numero }
  get serie() { return this.props.serie }
  get xml() { return this.props.xml }
  get protocolo() { return this.props.protocolo }
  get status() { return this.props.status }
  get motivoCancelamento() { return this.props.motivoCancelamento }
  get createdAt() { return this.props.createdAt }

  get estaAutorizada(): boolean {
    return this.status === 'AUTORIZADA'
  }

  get estaCancelada(): boolean {
    return this.status === 'CANCELADA'
  }
}
