import { DomainError } from './DomainError.ts'

export class NfceNaoEncontradaError extends DomainError {
  readonly statusCode = 404

  constructor(id: string) {
    super(`NFC-e não encontrada: ${id}`)
  }
}

export class NfceJaCanceladaError extends DomainError {
  readonly statusCode = 409

  constructor(id: string) {
    super(`NFC-e já está cancelada: ${id}`)
  }
}

export class NfceEmissaoFalhouError extends DomainError {
  readonly statusCode = 422

  constructor(motivo: string) {
    super(`Falha ao emitir NFC-e: ${motivo}`)
  }
}

export class NfceCancelamentoFalhouError extends DomainError {
  readonly statusCode = 422

  constructor(motivo: string) {
    super(`Falha ao cancelar NFC-e: ${motivo}`)
  }
}
