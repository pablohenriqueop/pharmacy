import { DomainError } from './DomainError.ts'

export class ProdutoNaoEncontradoError extends DomainError {
  readonly statusCode = 404

  constructor(identificador: string) {
    super(`Produto não encontrado: ${identificador}`)
  }
}

export class CodigoBarrasDuplicadoError extends DomainError {
  readonly statusCode = 409

  constructor(codigoBarras: string) {
    super(`Já existe um produto com o código de barras: ${codigoBarras}`)
  }
}
