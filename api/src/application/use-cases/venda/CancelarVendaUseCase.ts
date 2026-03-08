import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'
import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'
import { VendaNaoEncontradaError, VendaJaCanceladaError } from '@/domain/errors/VendaErrors.ts'

export class CancelarVendaUseCase {
  constructor(
    private readonly vendaRepo: IVendaRepository,
    private readonly produtoRepo: IProdutoRepository,
  ) {}

  async execute(tenantId: string, vendaId: string) {
    const venda = await this.vendaRepo.buscarPorId(tenantId, vendaId)
    if (!venda) {
      throw new VendaNaoEncontradaError(vendaId)
    }
    if (venda.estaCancelada) {
      throw new VendaJaCanceladaError(vendaId)
    }

    // Estorna estoque
    for (const item of venda.itens) {
      const produto = await this.produtoRepo.buscarPorId(tenantId, item.produtoId)
      if (produto) {
        await this.produtoRepo.atualizar(tenantId, item.produtoId, {
          estoqueAtual: produto.estoqueAtual + item.quantidade,
        })
      }
    }

    const cancelada = await this.vendaRepo.cancelar(tenantId, vendaId)
    return cancelada!
  }
}
