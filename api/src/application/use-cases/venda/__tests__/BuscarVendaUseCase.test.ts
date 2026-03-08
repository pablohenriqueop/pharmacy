import { describe, it, expect, beforeEach } from 'bun:test'
import { BuscarVendaUseCase } from '../BuscarVendaUseCase.ts'
import { InMemoryVendaRepository } from '@/test/repositories/InMemoryVendaRepository.ts'
import { VendaNaoEncontradaError } from '@/domain/errors/VendaErrors.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('BuscarVendaUseCase', () => {
  let vendaRepo: InMemoryVendaRepository
  let sut: BuscarVendaUseCase

  beforeEach(() => {
    vendaRepo = new InMemoryVendaRepository()
    sut = new BuscarVendaUseCase(vendaRepo)
  })

  it('deve buscar venda por id', async () => {
    const venda = await vendaRepo.criar({
      tenantId: TENANT,
      caixaId: 'c1',
      formaPagamento: 'PIX',
      itens: [{ produtoId: 'p1', quantidade: 1, precoUnit: 10 }],
      total: 10,
      troco: null,
    })

    const resultado = await sut.execute(TENANT, venda.id)
    expect(resultado.id).toBe(venda.id)
  })

  it('deve lançar erro ao buscar venda inexistente', async () => {
    expect(
      sut.execute(TENANT, 'id-inexistente')
    ).rejects.toBeInstanceOf(VendaNaoEncontradaError)
  })
})
