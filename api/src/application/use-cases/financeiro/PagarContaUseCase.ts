import type { IContaRepository } from '@/application/repositories/IContaRepository.ts'
import { ContaNaoEncontradaError, ContaJaPagaError, ContaJaCanceladaError } from '@/domain/errors/ContaErrors.ts'

export class PagarContaUseCase {
  constructor(private readonly contaRepo: IContaRepository) {}

  async execute(tenantId: string, id: string) {
    const conta = await this.contaRepo.buscarPorId(tenantId, id)
    if (!conta) {
      throw new ContaNaoEncontradaError(id)
    }
    if (conta.estaPaga) {
      throw new ContaJaPagaError(id)
    }
    if (conta.status === 'CANCELADA') {
      throw new ContaJaCanceladaError(id)
    }

    const paga = await this.contaRepo.pagar(tenantId, id)
    return paga!
  }
}
