import { describe, it, expect, beforeEach } from 'bun:test'
import { RelatorioVendasUseCase } from '../RelatorioVendasUseCase.ts'
import { InMemoryRelatorioRepository } from '@/test/repositories/InMemoryRelatorioRepository.ts'
import { Venda } from '@/domain/entities/Venda.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

function criarVenda(overrides: Partial<Venda['props']> = {}): Venda {
  return new Venda({
    id: crypto.randomUUID(),
    tenantId: TENANT,
    caixaId: 'c1',
    total: 25,
    desconto: 0,
    formaPagamento: 'DINHEIRO',
    valorPago: 30,
    troco: 5,
    status: 'CONCLUIDA',
    nfceChave: null,
    createdAt: new Date('2026-03-01T10:00:00'),
    itens: [],
    ...overrides,
  })
}

describe('RelatorioVendasUseCase', () => {
  let repo: InMemoryRelatorioRepository
  let sut: RelatorioVendasUseCase

  beforeEach(() => {
    repo = new InMemoryRelatorioRepository()
    sut = new RelatorioVendasUseCase(repo)
  })

  it('deve retornar vendas agrupadas por dia', async () => {
    repo.vendas = [
      criarVenda({ total: 25, formaPagamento: 'DINHEIRO', createdAt: new Date('2026-03-01T10:00:00') }),
      criarVenda({ total: 50, formaPagamento: 'PIX', createdAt: new Date('2026-03-01T14:00:00') }),
      criarVenda({ total: 30, formaPagamento: 'DINHEIRO', createdAt: new Date('2026-03-02T09:00:00') }),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-03'),
    })

    expect(resultado).toHaveLength(2)
    expect(resultado[0]!.data).toBe('2026-03-01')
    expect(resultado[0]!.totalVendas).toBe(75)
    expect(resultado[0]!.quantidadeVendas).toBe(2)
    expect(resultado[1]!.totalVendas).toBe(30)
  })

  it('deve agrupar por forma de pagamento dentro do dia', async () => {
    repo.vendas = [
      criarVenda({ total: 20, formaPagamento: 'DINHEIRO' }),
      criarVenda({ total: 30, formaPagamento: 'PIX' }),
      criarVenda({ total: 15, formaPagamento: 'DINHEIRO' }),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-02'),
    })

    const dia = resultado[0]!
    expect(dia.vendasPorFormaPagamento['DINHEIRO']!.quantidade).toBe(2)
    expect(dia.vendasPorFormaPagamento['DINHEIRO']!.total).toBe(35)
    expect(dia.vendasPorFormaPagamento['PIX']!.quantidade).toBe(1)
  })

  it('deve ignorar vendas canceladas', async () => {
    repo.vendas = [
      criarVenda({ total: 25 }),
      criarVenda({ total: 50, status: 'CANCELADA' }),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-02'),
    })

    expect(resultado[0]!.totalVendas).toBe(25)
    expect(resultado[0]!.quantidadeVendas).toBe(1)
  })

  it('deve retornar vazio quando não há vendas no período', async () => {
    repo.vendas = [criarVenda({ createdAt: new Date('2026-01-01') })]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-31'),
    })

    expect(resultado).toHaveLength(0)
  })

  it('deve isolar por tenant', async () => {
    repo.vendas = [
      criarVenda({ tenantId: 'outro-tenant', total: 100 }),
      criarVenda({ total: 25 }),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-02'),
    })

    expect(resultado[0]!.totalVendas).toBe(25)
  })
})
