import { DomainError } from './DomainError.ts'

export class CategoriaNaoEncontradaError extends DomainError {
  readonly statusCode = 404

  constructor(identificador: string) {
    super(`Categoria não encontrada: ${identificador}`)
  }
}

export class CategoriaDuplicadaError extends DomainError {
  readonly statusCode = 409

  constructor(nome: string) {
    super(`Já existe uma categoria com o nome: ${nome}`)
  }
}
