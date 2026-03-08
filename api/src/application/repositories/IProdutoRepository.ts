import type { Produto, CriarProdutoInput, AtualizarProdutoInput } from '@/domain/entities/Produto.ts'

export interface IProdutoRepository {
  criar(input: CriarProdutoInput): Promise<Produto>
  buscarPorId(tenantId: string, id: string): Promise<Produto | null>
  buscarPorCodigoBarras(tenantId: string, codigoBarras: string): Promise<Produto | null>
  listar(tenantId: string, filtros?: { nome?: string; categoria?: string; ativo?: boolean }): Promise<Produto[]>
  atualizar(tenantId: string, id: string, input: AtualizarProdutoInput): Promise<Produto | null>
  desativar(tenantId: string, id: string): Promise<boolean>
}
