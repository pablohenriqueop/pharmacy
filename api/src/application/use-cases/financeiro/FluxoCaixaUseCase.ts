import type { IFluxoCaixaRepository } from '@/application/repositories/IFluxoCaixaRepository.ts'
import type { FiltroRelatorio } from '@/domain/entities/Relatorio.ts'

export class FluxoCaixaUseCase {
  constructor(private readonly fluxoRepo: IFluxoCaixaRepository) {}

  async execute(tenantId: string, filtro: FiltroRelatorio) {
    return this.fluxoRepo.fluxoPorPeriodo(tenantId, filtro)
  }
}
