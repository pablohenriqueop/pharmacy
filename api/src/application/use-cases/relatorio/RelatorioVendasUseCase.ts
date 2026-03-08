import type { IRelatorioRepository } from '@/application/repositories/IRelatorioRepository.ts'
import type { FiltroRelatorio } from '@/domain/entities/Relatorio.ts'

export class RelatorioVendasUseCase {
  constructor(private readonly relatorioRepo: IRelatorioRepository) {}

  async execute(tenantId: string, filtro: FiltroRelatorio) {
    return this.relatorioRepo.vendasPorPeriodo(tenantId, filtro)
  }
}
