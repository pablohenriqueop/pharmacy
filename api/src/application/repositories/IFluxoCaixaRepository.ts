import type { FluxoCaixaItem } from '@/domain/entities/Conta.ts'
import type { FiltroRelatorio } from '@/domain/entities/Relatorio.ts'

export interface IFluxoCaixaRepository {
  fluxoPorPeriodo(tenantId: string, filtro: FiltroRelatorio): Promise<FluxoCaixaItem[]>
}
