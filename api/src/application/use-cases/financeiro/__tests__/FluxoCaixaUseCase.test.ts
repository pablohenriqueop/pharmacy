import { describe, it, expect, beforeEach } from 'bun:test'
import { FluxoCaixaUseCase } from '../FluxoCaixaUseCase.ts'
import { InMemoryFluxoCaixaRepository } from '@/test/repositories/InMemoryFluxoCaixaRepository.ts'
import { Venda } from '@/domain/entities/Venda.ts'
import { Conta } from '@/domain/entities/Conta.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

function criarVenda(total: number, data: string): Venda {
  return new Venda({
    id: crypto.randomUUID(), tenantId: TENANT, caixaId: 'c1', total, desconto: 0,
    formaPagamento: 'DINHEIRO', valorPago: total, troco: 0, status: 'CONCLUIDA',
    nfceChave: null, createdAt: new Date(data), itens: [],
  })
}

function criarConta(tipo: 'PAGAR' | 'RECEBER', valor: number, dataPagamento: string): Conta {
  return new Conta({
    id: crypto.randomUUID(), tenantId: TENANT, tipo, descricao: 'Teste', valor,
    categoria: null, dataVencimento: new Date(dataPagamento),
    dataPagamento: new Date(dataPagamento), status: 'PAGA',
    createdAt: new Date(), updatedAt: new Date(),
  })
}

describe('FluxoCaixaUseCase', () => {
  let repo: InMemoryFluxoCaixaRepository
  let sut: FluxoCaixaUseCase

  beforeEach(() => {
    repo = new InMemoryFluxoCaixaRepository()
    sut = new FluxoCaixaUseCase(repo)
  })

  it('deve calcular fluxo com entradas e saídas', async () => {
    repo.vendas = [
      criarVenda(100, '2026-03-01T10:00:00'),
      criarVenda(200, '2026-03-01T14:00:00'),
      criarVenda(150, '2026-03-02T10:00:00'),
    ]
    repo.contas = [
      criarConta('PAGAR', 80, '2026-03-01T12:00:00'),
      criarConta('PAGAR', 50, '2026-03-02T12:00:00'),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-03'),
    })

    expect(resultado).toHaveLength(2)
    expect(resultado[0]!.data).toBe('2026-03-01')
    expect(resultado[0]!.entradas).toBe(300)
    expect(resultado[0]!.saidas).toBe(80)
    expect(resultado[0]!.saldo).toBe(220)
    expect(resultado[1]!.saldo).toBe(100)
  })

  it('deve incluir contas a receber pagas como entrada', async () => {
    repo.contas = [
      criarConta('RECEBER', 200, '2026-03-01T10:00:00'),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-02'),
    })

    expect(resultado[0]!.entradas).toBe(200)
    expect(resultado[0]!.saidas).toBe(0)
  })

  it('deve retornar vazio sem movimentações', async () => {
    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-31'),
    })

    expect(resultado).toHaveLength(0)
  })
})
