import type { CriarProdutoInput } from '@/domain/entities/Produto.ts'
import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'
import { CodigoBarrasDuplicadoError } from '@/domain/errors/ProdutoErrors.ts'

export class CadastrarProdutoUseCase {
  constructor(private readonly produtoRepo: IProdutoRepository) {}

  async execute(input: CriarProdutoInput) {
    if (input.codigoBarras) {
      const existente = await this.produtoRepo.buscarPorCodigoBarras(input.tenantId, input.codigoBarras)
      if (existente) {
        throw new CodigoBarrasDuplicadoError(input.codigoBarras)
      }
    }

    return this.produtoRepo.criar(input)
  }
}
