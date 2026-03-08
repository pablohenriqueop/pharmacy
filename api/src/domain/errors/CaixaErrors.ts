import { DomainError } from './DomainError.ts'

export class CaixaNaoEncontradoError extends DomainError {
  readonly statusCode = 404

  constructor(id: string) {
    super(`Caixa não encontrado: ${id}`)
  }
}

export class CaixaJaFechadoError extends DomainError {
  readonly statusCode = 409

  constructor(id: string) {
    super(`Caixa já está fechado: ${id}`)
  }
}

export class NenhumCaixaAbertoError extends DomainError {
  readonly statusCode = 409

  constructor() {
    super('Não há caixa aberto no momento')
  }
}
