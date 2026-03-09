export interface CategoriaResponse {
  id: string
  tenantId: string
  nome: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface CriarCategoriaRequest {
  nome: string
}

export interface AtualizarCategoriaRequest {
  nome?: string
  ativo?: boolean
}
