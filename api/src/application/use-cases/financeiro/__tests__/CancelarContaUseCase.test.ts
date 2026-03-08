import { describe, it, expect, beforeEach } from 'bun:test'
import { CancelarContaUseCase } from '../CancelarContaUseCase.ts'
import { InMemoryContaRepository } from '@/test/repositories/InMemoryContaRepository.ts'
import { ContaNaoEncontradaError, ContaJaPagaError, ContaJaCanceladaError } from '@/domain/errors/ContaErrors.ts'
import type { Conta } from '@/domain/entities/Conta.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('CancelarContaUseCase', () => {
  let repo: InMemoryContaRepository
  let sut: CancelarContaUseCase
  let conta: Conta

  beforeEach(async () => {
    repo = new InMemoryContaRepository()
    sut = new CancelarContaUseCase(repo)

    conta = await repo.criar({
      tenantId: TENANT,
      tipo: 'PAGAR',
      descricao: 'Fornecedor',
      valor: 500,
      dataVencimento: new Date('2026-03-15'),
    })
  })

  it('deve cancelar conta pendente', async () => {
    const cancelada = await sut.execute(TENANT, conta.id)
    expect(cancelada.status).toBe('CANCELADA')
  })

  it('deve lançar erro ao cancelar conta inexistente', async () => {
    expect(
      sut.execute(TENANT, 'id-inexistente')
    ).rejects.toBeInstanceOf(ContaNaoEncontradaError)
  })

  it('deve lançar erro ao cancelar conta já paga', async () => {
    await repo.pagar(TENANT, conta.id)

    expect(
      sut.execute(TENANT, conta.id)
    ).rejects.toBeInstanceOf(ContaJaPagaError)
  })

  it('deve lançar erro ao cancelar conta já cancelada', async () => {
    await repo.cancelar(TENANT, conta.id)

    expect(
      sut.execute(TENANT, conta.id)
    ).rejects.toBeInstanceOf(ContaJaCanceladaError)
  })
})
