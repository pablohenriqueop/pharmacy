import { describe, it, expect, beforeEach } from 'bun:test'
import { CancelarVendaUseCase } from '../CancelarVendaUseCase.ts'
import { CriarVendaUseCase } from '../CriarVendaUseCase.ts'
import { InMemoryVendaRepository } from '@/test/repositories/InMemoryVendaRepository.ts'
import { InMemoryProdutoRepository } from '@/test/repositories/InMemoryProdutoRepository.ts'
import { InMemoryCaixaRepository } from '@/test/repositories/InMemoryCaixaRepository.ts'
import { VendaNaoEncontradaError, VendaJaCanceladaError } from '@/domain/errors/VendaErrors.ts'
import type { Venda } from '@/domain/entities/Venda.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('CancelarVendaUseCase', () => {
  let vendaRepo: InMemoryVendaRepository
  let produtoRepo: InMemoryProdutoRepository
  let caixaRepo: InMemoryCaixaRepository
  let criarVenda: CriarVendaUseCase
  let sut: CancelarVendaUseCase
  let venda: Venda

  beforeEach(async () => {
    vendaRepo = new InMemoryVendaRepository()
    produtoRepo = new InMemoryProdutoRepository()
    caixaRepo = new InMemoryCaixaRepository()
    criarVenda = new CriarVendaUseCase(vendaRepo, produtoRepo, caixaRepo)
    sut = new CancelarVendaUseCase(vendaRepo, produtoRepo)

    const produto = await produtoRepo.criar({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
      estoqueAtual: 50,
    })

    const caixa = await caixaRepo.abrir({ tenantId: TENANT, valorAbertura: 100.0 })

    venda = await criarVenda.execute({
      tenantId: TENANT,
      caixaId: caixa.id,
      formaPagamento: 'DINHEIRO',
      valorPago: 20.0,
      itens: [{ produtoId: produto.id, quantidade: 3, precoUnit: 8.5 }],
    })
  })

  it('deve cancelar uma venda e estornar estoque', async () => {
    const produtoAntes = await produtoRepo.buscarPorId(TENANT, venda.itens[0]!.produtoId)
    expect(produtoAntes!.estoqueAtual).toBe(47)

    const cancelada = await sut.execute(TENANT, venda.id)

    expect(cancelada.status).toBe('CANCELADA')

    const produtoDepois = await produtoRepo.buscarPorId(TENANT, venda.itens[0]!.produtoId)
    expect(produtoDepois!.estoqueAtual).toBe(50)
  })

  it('deve lançar erro ao cancelar venda inexistente', async () => {
    expect(
      sut.execute(TENANT, 'id-inexistente')
    ).rejects.toBeInstanceOf(VendaNaoEncontradaError)
  })

  it('deve lançar erro ao cancelar venda já cancelada', async () => {
    await sut.execute(TENANT, venda.id)

    expect(
      sut.execute(TENANT, venda.id)
    ).rejects.toBeInstanceOf(VendaJaCanceladaError)
  })
})
