import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'

export class ListarVendasUseCase {
  constructor(private readonly vendaRepo: IVendaRepository) {}

  async execute(tenantId: string, caixaId: string) {
    return this.vendaRepo.listarPorCaixa(tenantId, caixaId)
  }
}
