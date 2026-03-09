import type { Conta, CriarContaInput, TipoConta, StatusConta } from '@/domain/entities/Conta.ts'
import type { PaginacaoParams, ResultadoPaginado } from '@/domain/entities/Paginacao.ts'

export interface FiltroContas {
  tipo?: TipoConta
  status?: StatusConta
  dataInicio?: Date
  dataFim?: Date
}

export interface IContaRepository {
  criar(input: CriarContaInput): Promise<Conta>
  buscarPorId(tenantId: string, id: string): Promise<Conta | null>
  listar(tenantId: string, filtros?: FiltroContas, paginacao?: PaginacaoParams): Promise<ResultadoPaginado<Conta>>
  pagar(tenantId: string, id: string): Promise<Conta | null>
  cancelar(tenantId: string, id: string): Promise<Conta | null>
}
