import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'

export class ListarProdutosUseCase {
  constructor(private readonly produtoRepo: IProdutoRepository) {}

  async execute(tenantId: string, filtros?: { nome?: string; categoria?: string; ativo?: boolean }) {
    return this.produtoRepo.listar(tenantId, filtros)
  }
}
