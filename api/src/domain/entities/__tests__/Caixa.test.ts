import { describe, it, expect } from 'bun:test'
import { Caixa } from '../Caixa.ts'

describe('Caixa', () => {
  it('deve expor todas as propriedades e indicar aberto', () => {
    const caixa = new Caixa({
      id: '1',
      tenantId: 't1',
      valorAbertura: 100,
      valorFechamento: null,
      aberturaEm: new Date(),
      fechamentoEm: null,
      status: 'ABERTO',
    })

    expect(caixa.id).toBe('1')
    expect(caixa.tenantId).toBe('t1')
    expect(caixa.valorAbertura).toBe(100)
    expect(caixa.valorFechamento).toBeNull()
    expect(caixa.aberturaEm).toBeInstanceOf(Date)
    expect(caixa.fechamentoEm).toBeNull()
    expect(caixa.status).toBe('ABERTO')
    expect(caixa.estaAberto).toBe(true)
  })

  it('deve indicar fechado', () => {
    const caixa = new Caixa({
      id: '1',
      tenantId: 't1',
      valorAbertura: 100,
      valorFechamento: 850,
      aberturaEm: new Date(),
      fechamentoEm: new Date(),
      status: 'FECHADO',
    })

    expect(caixa.estaAberto).toBe(false)
  })
})
