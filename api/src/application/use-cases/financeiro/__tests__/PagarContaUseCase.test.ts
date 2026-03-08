import { describe, it, expect, beforeEach } from 'bun:test'
import { PagarContaUseCase } from '../PagarContaUseCase.ts'
import { InMemoryContaRepository } from '@/test/repositories/InMemoryContaRepository.ts'
import { ContaNaoEncontradaError, ContaJaPagaError, ContaJaCanceladaError } from '@/domain/errors/ContaErrors.ts'
import type { Conta } from '@/domain/entities/Conta.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('PagarContaUseCase', () => {
  let repo: InMemoryContaRepository
  let sut: PagarContaUseCase
  let conta: Conta

  beforeEach(async () => {
    repo = new InMemoryContaRepository()
    sut = new PagarContaUseCase(repo)

    conta = await repo.criar({
      tenantId: TENANT,
      tipo: 'PAGAR',
      descricao: 'Fornecedor',
      valor: 500,
      dataVencimento: new Date('2026-03-15'),
    })
  })

  it('deve pagar conta pendente', async () => {
    const paga = await sut.execute(TENANT, conta.id)

    expect(paga.status).toBe('PAGA')
    expect(paga.dataPagamento).not.toBeNull()
  })

  it('deve lançar erro ao pagar conta inexistente', async () => {
    expect(
      sut.execute(TENANT, 'id-inexistente')
    ).rejects.toBeInstanceOf(ContaNaoEncontradaError)
  })

  it('deve lançar erro ao pagar conta já paga', async () => {
    await repo.pagar(TENANT, conta.id)

    expect(
      sut.execute(TENANT, conta.id)
    ).rejects.toBeInstanceOf(ContaJaPagaError)
  })

  it('deve lançar erro ao pagar conta cancelada', async () => {
    await repo.cancelar(TENANT, conta.id)

    expect(
      sut.execute(TENANT, conta.id)
    ).rejects.toBeInstanceOf(ContaJaCanceladaError)
  })
})
