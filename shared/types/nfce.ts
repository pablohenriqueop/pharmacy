export type NfceStatus = 'AUTORIZADA' | 'CANCELADA' | 'REJEITADA' | 'PENDENTE'

export interface NfceResponse {
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
  createdAt: string
}

export interface EmitirNfceRequest {
  vendaId: string
}

export interface CancelarNfceRequest {
  motivo: string
}
