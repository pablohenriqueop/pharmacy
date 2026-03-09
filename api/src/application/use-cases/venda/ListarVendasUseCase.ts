import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'
import type { PaginacaoParams } from '@/domain/entities/Paginacao.ts'

export class ListarVendasUseCase {
  constructor(private readonly vendaRepo: IVendaRepository) {}

  async execute(tenantId: string, caixaId: string, paginacao?: PaginacaoParams) {
    return this.vendaRepo.listarPorCaixa(tenantId, caixaId, paginacao)
  }
}
