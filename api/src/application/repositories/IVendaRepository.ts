import type { Venda, CriarVendaInput } from '@/domain/entities/Venda.ts'
import type { PaginacaoParams, ResultadoPaginado } from '@/domain/entities/Paginacao.ts'

export interface IVendaRepository {
  criar(input: CriarVendaInput & { total: number; troco: number | null }): Promise<Venda>
  buscarPorId(tenantId: string, id: string): Promise<Venda | null>
  listarPorCaixa(tenantId: string, caixaId: string, paginacao?: PaginacaoParams): Promise<ResultadoPaginado<Venda>>
  cancelar(tenantId: string, id: string): Promise<Venda | null>
  atualizarNfceChave(tenantId: string, id: string, nfceChave: string): Promise<void>
}
