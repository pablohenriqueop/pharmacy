import type { VendaPorPeriodo, ProdutoMaisVendido, AlertaEstoque, FiltroRelatorio } from '@/domain/entities/Relatorio.ts'

export interface IRelatorioRepository {
  vendasPorPeriodo(tenantId: string, filtro: FiltroRelatorio): Promise<VendaPorPeriodo[]>
  produtosMaisVendidos(tenantId: string, filtro: FiltroRelatorio, limite?: number): Promise<ProdutoMaisVendido[]>
  alertasEstoque(tenantId: string): Promise<AlertaEstoque[]>
}
