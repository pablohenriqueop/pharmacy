import type { AtualizarProdutoInput } from '@/domain/entities/Produto.ts'
import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'
import { ProdutoNaoEncontradoError, CodigoBarrasDuplicadoError } from '@/domain/errors/ProdutoErrors.ts'

export class AtualizarProdutoUseCase {
  constructor(private readonly produtoRepo: IProdutoRepository) {}

  async execute(tenantId: string, id: string, input: AtualizarProdutoInput) {
    if (input.codigoBarras) {
      const existente = await this.produtoRepo.buscarPorCodigoBarras(tenantId, input.codigoBarras)
      if (existente && existente.id !== id) {
        throw new CodigoBarrasDuplicadoError(input.codigoBarras)
      }
    }

    const atualizado = await this.produtoRepo.atualizar(tenantId, id, input)
    if (!atualizado) {
      throw new ProdutoNaoEncontradoError(id)
    }

    return atualizado
  }
}
