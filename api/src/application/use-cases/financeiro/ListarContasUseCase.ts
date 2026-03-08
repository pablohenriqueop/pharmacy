import type { IContaRepository, FiltroContas } from '@/application/repositories/IContaRepository.ts'

export class ListarContasUseCase {
  constructor(private readonly contaRepo: IContaRepository) {}

  async execute(tenantId: string, filtros?: FiltroContas) {
    return this.contaRepo.listar(tenantId, filtros)
  }
}
