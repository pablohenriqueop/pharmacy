import { describe, it, expect, beforeEach } from 'bun:test'
import { ListarVendasUseCase } from '../ListarVendasUseCase.ts'
import { InMemoryVendaRepository } from '@/test/repositories/InMemoryVendaRepository.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('ListarVendasUseCase', () => {
  let vendaRepo: InMemoryVendaRepository
  let sut: ListarVendasUseCase

  beforeEach(async () => {
    vendaRepo = new InMemoryVendaRepository()
    sut = new ListarVendasUseCase(vendaRepo)

    await vendaRepo.criar({
      tenantId: TENANT,
      caixaId: 'c1',
      formaPagamento: 'PIX',
      itens: [{ produtoId: 'p1', quantidade: 1, precoUnit: 10 }],
      total: 10,
      troco: null,
    })

    await vendaRepo.criar({
      tenantId: TENANT,
      caixaId: 'c1',
      formaPagamento: 'DINHEIRO',
      valorPago: 20,
      itens: [{ produtoId: 'p2', quantidade: 2, precoUnit: 5 }],
      total: 10,
      troco: 10,
    })

    await vendaRepo.criar({
      tenantId: TENANT,
      caixaId: 'c2',
      formaPagamento: 'CARTAO_CREDITO',
      itens: [{ produtoId: 'p1', quantidade: 1, precoUnit: 15 }],
      total: 15,
      troco: null,
    })
  })

  it('deve listar vendas de um caixa específico', async () => {
    const vendas = await sut.execute(TENANT, 'c1')
    expect(vendas).toHaveLength(2)
  })

  it('deve retornar lista vazia para caixa sem vendas', async () => {
    const vendas = await sut.execute(TENANT, 'caixa-sem-vendas')
    expect(vendas).toHaveLength(0)
  })
})
