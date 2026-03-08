import { describe, it, expect } from 'bun:test'
import { Conta } from '../Conta.ts'

describe('Conta', () => {
  const base = {
    id: '1', tenantId: 't1', tipo: 'PAGAR' as const, descricao: 'Fornecedor',
    valor: 500, categoria: 'Insumos', dataVencimento: new Date('2026-03-15'),
    dataPagamento: null, status: 'PENDENTE' as const,
    createdAt: new Date(), updatedAt: new Date(),
  }

  it('deve expor todas as propriedades', () => {
    const conta = new Conta(base)

    expect(conta.id).toBe('1')
    expect(conta.tenantId).toBe('t1')
    expect(conta.tipo).toBe('PAGAR')
    expect(conta.descricao).toBe('Fornecedor')
    expect(conta.valor).toBe(500)
    expect(conta.categoria).toBe('Insumos')
    expect(conta.dataPagamento).toBeNull()
    expect(conta.status).toBe('PENDENTE')
  })

  it('deve indicar paga', () => {
    const conta = new Conta({ ...base, status: 'PAGA', dataPagamento: new Date() })
    expect(conta.estaPaga).toBe(true)
    expect(conta.estaVencida).toBe(false)
  })

  it('deve indicar vencida quando pendente e data passou', () => {
    const conta = new Conta({ ...base, dataVencimento: new Date('2020-01-01') })
    expect(conta.estaVencida).toBe(true)
  })

  it('não deve indicar vencida quando pendente e data futura', () => {
    const conta = new Conta({ ...base, dataVencimento: new Date('2099-12-31') })
    expect(conta.estaVencida).toBe(false)
  })

  it('não deve indicar vencida quando cancelada', () => {
    const conta = new Conta({ ...base, status: 'CANCELADA', dataVencimento: new Date('2020-01-01') })
    expect(conta.estaVencida).toBe(false)
  })
})
