export type CaixaStatus = 'ABERTO' | 'FECHADO'

export interface CaixaResponse {
  id: string
  tenantId: string
  valorAbertura: number
  valorFechamento: number | null
  aberturaEm: string
  fechamentoEm: string | null
  status: CaixaStatus
}

export interface AbrirCaixaRequest {
  valorAbertura: number
}

export interface FecharCaixaRequest {
  valorFechamento: number
}
