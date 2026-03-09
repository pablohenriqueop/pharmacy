import type { IContaRepository, FiltroContas } from '@/application/repositories/IContaRepository.ts'
import type { PaginacaoParams } from '@/domain/entities/Paginacao.ts'

export class ListarContasUseCase {
  constructor(private readonly contaRepo: IContaRepository) {}

  async execute(tenantId: string, filtros?: FiltroContas, paginacao?: PaginacaoParams) {
    return this.contaRepo.listar(tenantId, filtros, paginacao)
  }
}
