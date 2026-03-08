import type { IRelatorioRepository } from '@/application/repositories/IRelatorioRepository.ts'
import type { FiltroRelatorio } from '@/domain/entities/Relatorio.ts'

export class ProdutosMaisVendidosUseCase {
  constructor(private readonly relatorioRepo: IRelatorioRepository) {}

  async execute(tenantId: string, filtro: FiltroRelatorio, limite: number = 10) {
    return this.relatorioRepo.produtosMaisVendidos(tenantId, filtro, limite)
  }
}
