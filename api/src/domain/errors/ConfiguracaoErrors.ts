import { DomainError } from './DomainError.ts'

export class ConfiguracaoNaoEncontradaError extends DomainError {
  readonly statusCode = 404

  constructor(tenantId: string) {
    super(`Configuração não encontrada para o tenant: ${tenantId}`)
  }
}
