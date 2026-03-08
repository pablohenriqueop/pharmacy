import type { IRelatorioRepository } from '@/application/repositories/IRelatorioRepository.ts'

export class AlertaEstoqueUseCase {
  constructor(private readonly relatorioRepo: IRelatorioRepository) {}

  async execute(tenantId: string) {
    return this.relatorioRepo.alertasEstoque(tenantId)
  }
}
