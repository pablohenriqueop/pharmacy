export interface ConfiguracaoResponse {
  id: string
  tenantId: string
  nomeFarmacia: string
  corPrimaria: string
  corSecundaria: string
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AtualizarConfiguracaoRequest {
  nomeFarmacia: string
  corPrimaria?: string
  corSecundaria?: string
  logoUrl?: string | null
}
