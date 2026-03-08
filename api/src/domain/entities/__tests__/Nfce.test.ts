import { describe, it, expect } from 'bun:test'
import { Nfce } from '../Nfce.ts'
import type { NfceProps } from '../Nfce.ts'

function criaNfce(overrides: Partial<NfceProps> = {}): Nfce {
  return new Nfce({
    id: 'nfce-1',
    tenantId: 'tenant-1',
    vendaId: 'venda-1',
    chave: '35250612345678901234550010000000011123456789',
    numero: 1,
    serie: 1,
    xml: '<nfeProc></nfeProc>',
    protocolo: '135250600000001',
    status: 'AUTORIZADA',
    motivoCancelamento: null,
    createdAt: new Date(),
    ...overrides,
  })
}

describe('Nfce', () => {
  it('deve retornar estaAutorizada true quando status é AUTORIZADA', () => {
    const nfce = criaNfce({ status: 'AUTORIZADA' })
    expect(nfce.estaAutorizada).toBe(true)
    expect(nfce.estaCancelada).toBe(false)
  })

  it('deve retornar estaCancelada true quando status é CANCELADA', () => {
    const nfce = criaNfce({ status: 'CANCELADA' })
    expect(nfce.estaCancelada).toBe(true)
    expect(nfce.estaAutorizada).toBe(false)
  })

  it('deve expor todos os getters corretamente', () => {
    const nfce = criaNfce()
    expect(nfce.id).toBe('nfce-1')
    expect(nfce.tenantId).toBe('tenant-1')
    expect(nfce.vendaId).toBe('venda-1')
    expect(nfce.chave).toHaveLength(44)
    expect(nfce.numero).toBe(1)
    expect(nfce.serie).toBe(1)
    expect(nfce.xml).toContain('nfeProc')
    expect(nfce.protocolo).toBeDefined()
    expect(nfce.motivoCancelamento).toBeNull()
    expect(nfce.createdAt).toBeInstanceOf(Date)
  })
})
