import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'
import { ProdutoNaoEncontradoError } from '@/domain/errors/ProdutoErrors.ts'

export class BuscarProdutoUseCase {
  constructor(private readonly produtoRepo: IProdutoRepository) {}

  async porId(tenantId: string, id: string) {
    const produto = await this.produtoRepo.buscarPorId(tenantId, id)
    if (!produto) {
      throw new ProdutoNaoEncontradoError(id)
    }
    return produto
  }

  async porCodigoBarras(tenantId: string, codigoBarras: string) {
    const produto = await this.produtoRepo.buscarPorCodigoBarras(tenantId, codigoBarras)
    if (!produto) {
      throw new ProdutoNaoEncontradoError(codigoBarras)
    }
    return produto
  }
}
