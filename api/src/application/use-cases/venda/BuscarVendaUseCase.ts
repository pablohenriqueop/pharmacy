import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'
import { VendaNaoEncontradaError } from '@/domain/errors/VendaErrors.ts'

export class BuscarVendaUseCase {
  constructor(private readonly vendaRepo: IVendaRepository) {}

  async execute(tenantId: string, id: string) {
    const venda = await this.vendaRepo.buscarPorId(tenantId, id)
    if (!venda) {
      throw new VendaNaoEncontradaError(id)
    }
    return venda
  }
}
