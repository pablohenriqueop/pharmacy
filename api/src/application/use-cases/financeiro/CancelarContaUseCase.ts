import type { IContaRepository } from '@/application/repositories/IContaRepository.ts'
import { ContaNaoEncontradaError, ContaJaPagaError, ContaJaCanceladaError } from '@/domain/errors/ContaErrors.ts'

export class CancelarContaUseCase {
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

    const cancelada = await this.contaRepo.cancelar(tenantId, id)
    return cancelada!
  }
}
