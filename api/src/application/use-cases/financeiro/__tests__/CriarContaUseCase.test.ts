import { describe, it, expect, beforeEach } from 'bun:test'
import { CriarContaUseCase } from '../CriarContaUseCase.ts'
import { InMemoryContaRepository } from '@/test/repositories/InMemoryContaRepository.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('CriarContaUseCase', () => {
  let repo: InMemoryContaRepository
  let sut: CriarContaUseCase

  beforeEach(() => {
    repo = new InMemoryContaRepository()
    sut = new CriarContaUseCase(repo)
  })

  it('deve criar conta a pagar', async () => {
    const conta = await sut.execute({
      tenantId: TENANT,
      tipo: 'PAGAR',
      descricao: 'Fornecedor de medicamentos',
      valor: 1500.0,
      dataVencimento: new Date('2026-03-15'),
    })

    expect(conta.tipo).toBe('PAGAR')
    expect(conta.descricao).toBe('Fornecedor de medicamentos')
    expect(conta.valor).toBe(1500.0)
    expect(conta.status).toBe('PENDENTE')
    expect(conta.dataPagamento).toBeNull()
    expect(repo.items).toHaveLength(1)
  })

  it('deve criar conta a receber', async () => {
    const conta = await sut.execute({
      tenantId: TENANT,
      tipo: 'RECEBER',
      descricao: 'Venda fiado - João',
      valor: 85.0,
      categoria: 'Fiado',
      dataVencimento: new Date('2026-03-20'),
    })

    expect(conta.tipo).toBe('RECEBER')
    expect(conta.categoria).toBe('Fiado')
  })
})
