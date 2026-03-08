import { DomainError } from './DomainError.ts'

export class VendaNaoEncontradaError extends DomainError {
  readonly statusCode = 404

  constructor(id: string) {
    super(`Venda não encontrada: ${id}`)
  }
}

export class VendaJaCanceladaError extends DomainError {
  readonly statusCode = 409

  constructor(id: string) {
    super(`Venda já está cancelada: ${id}`)
  }
}

export class EstoqueInsuficienteError extends DomainError {
  readonly statusCode = 422

  constructor(produtoNome: string, disponivel: number, solicitado: number) {
    super(`Estoque insuficiente para "${produtoNome}": disponível ${disponivel}, solicitado ${solicitado}`)
  }
}

export class VendaSemItensError extends DomainError {
  readonly statusCode = 422

  constructor() {
    super('A venda precisa ter pelo menos um item')
  }
}
