import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'
import type { PaginacaoParams } from '@/domain/entities/Paginacao.ts'

export class ListarProdutosUseCase {
  constructor(private readonly produtoRepo: IProdutoRepository) {}

  async execute(tenantId: string, filtros?: { nome?: string; categoria?: string; ativo?: boolean }, paginacao?: PaginacaoParams) {
    return this.produtoRepo.listar(tenantId, filtros, paginacao)
  }
}
