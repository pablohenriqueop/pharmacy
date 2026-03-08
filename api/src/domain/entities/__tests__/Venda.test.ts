import { describe, it, expect } from 'bun:test'
import { Venda } from '../Venda.ts'

describe('Venda', () => {
  const props = {
    id: '1',
    tenantId: 't1',
    caixaId: 'c1',
    total: 25.5,
    desconto: 0,
    formaPagamento: 'DINHEIRO' as const,
    valorPago: 30,
    troco: 4.5,
    status: 'CONCLUIDA' as const,
    nfceChave: null,
    createdAt: new Date(),
    itens: [
      { id: 'i1', vendaId: '1', produtoId: 'p1', quantidade: 3, precoUnit: 8.5, subtotal: 25.5 },
    ],
  }

  it('deve expor todas as propriedades via getters', () => {
    const venda = new Venda(props)

    expect(venda.id).toBe('1')
    expect(venda.tenantId).toBe('t1')
    expect(venda.caixaId).toBe('c1')
    expect(venda.total).toBe(25.5)
    expect(venda.desconto).toBe(0)
    expect(venda.formaPagamento).toBe('DINHEIRO')
    expect(venda.valorPago).toBe(30)
    expect(venda.troco).toBe(4.5)
    expect(venda.status).toBe('CONCLUIDA')
    expect(venda.itens).toHaveLength(1)
  })

  it('não deve estar cancelada quando concluída', () => {
    const venda = new Venda(props)
    expect(venda.estaCancelada).toBe(false)
  })

  it('deve indicar cancelada', () => {
    const venda = new Venda({ ...props, status: 'CANCELADA' })
    expect(venda.estaCancelada).toBe(true)
  })
})
