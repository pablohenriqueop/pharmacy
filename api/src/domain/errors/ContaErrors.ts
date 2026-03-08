import { DomainError } from './DomainError.ts'

export class ContaNaoEncontradaError extends DomainError {
  readonly statusCode = 404

  constructor(id: string) {
    super(`Conta não encontrada: ${id}`)
  }
}

export class ContaJaPagaError extends DomainError {
  readonly statusCode = 409

  constructor(id: string) {
    super(`Conta já está paga: ${id}`)
  }
}

export class ContaJaCanceladaError extends DomainError {
  readonly statusCode = 409

  constructor(id: string) {
    super(`Conta já está cancelada: ${id}`)
  }
}
