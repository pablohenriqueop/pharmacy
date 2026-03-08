import type { CriarVendaInput } from '@/domain/entities/Venda.ts'
import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'
import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'
import type { ICaixaRepository } from '@/application/repositories/ICaixaRepository.ts'
import { EstoqueInsuficienteError, VendaSemItensError } from '@/domain/errors/VendaErrors.ts'
import { CaixaNaoEncontradoError, CaixaJaFechadoError } from '@/domain/errors/CaixaErrors.ts'
import { ProdutoNaoEncontradoError } from '@/domain/errors/ProdutoErrors.ts'

export class CriarVendaUseCase {
  constructor(
    private readonly vendaRepo: IVendaRepository,
    private readonly produtoRepo: IProdutoRepository,
    private readonly caixaRepo: ICaixaRepository,
  ) {}

  async execute(input: CriarVendaInput) {
    if (input.itens.length === 0) {
      throw new VendaSemItensError()
    }

    // Valida caixa
    const caixa = await this.caixaRepo.buscarPorId(input.tenantId, input.caixaId)
    if (!caixa) {
      throw new CaixaNaoEncontradoError(input.caixaId)
    }
    if (!caixa.estaAberto) {
      throw new CaixaJaFechadoError(input.caixaId)
    }

    // Valida estoque de todos os itens antes de criar a venda
    for (const item of input.itens) {
      const produto = await this.produtoRepo.buscarPorId(input.tenantId, item.produtoId)
      if (!produto) {
        throw new ProdutoNaoEncontradoError(item.produtoId)
      }
      if (produto.estoqueAtual < item.quantidade) {
        throw new EstoqueInsuficienteError(produto.nome, produto.estoqueAtual, item.quantidade)
      }
    }

    // Calcula total
    const subtotais = input.itens.map(i => i.precoUnit * i.quantidade)
    const totalBruto = subtotais.reduce((acc, val) => acc + val, 0)
    const desconto = input.desconto ?? 0
    const total = totalBruto - desconto

    // Calcula troco (só para dinheiro)
    let troco: number | null = null
    if (input.formaPagamento === 'DINHEIRO' && input.valorPago != null) {
      troco = input.valorPago - total
    }

    // Cria venda
    const venda = await this.vendaRepo.criar({ ...input, total, troco })

    // Decrementa estoque
    for (const item of input.itens) {
      const produto = await this.produtoRepo.buscarPorId(input.tenantId, item.produtoId)
      if (produto) {
        await this.produtoRepo.atualizar(input.tenantId, item.produtoId, {
          estoqueAtual: produto.estoqueAtual - item.quantidade,
        })
      }
    }

    return venda
  }
}
