import { describe, it, expect, beforeEach } from 'bun:test'
import { BuscarCaixaAbertoUseCase } from '../BuscarCaixaAbertoUseCase.ts'
import { InMemoryCaixaRepository } from '@/test/repositories/InMemoryCaixaRepository.ts'
import { NenhumCaixaAbertoError } from '@/domain/errors/CaixaErrors.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('BuscarCaixaAbertoUseCase', () => {
  let repo: InMemoryCaixaRepository
  let sut: BuscarCaixaAbertoUseCase

  beforeEach(() => {
    repo = new InMemoryCaixaRepository()
    sut = new BuscarCaixaAbertoUseCase(repo)
  })

  it('deve retornar o caixa aberto', async () => {
    const aberto = await repo.abrir({ tenantId: TENANT, valorAbertura: 100.0 })

    const resultado = await sut.execute(TENANT)
    expect(resultado.id).toBe(aberto.id)
  })

  it('deve lançar erro quando não há caixa aberto', async () => {
    expect(
      sut.execute(TENANT)
    ).rejects.toBeInstanceOf(NenhumCaixaAbertoError)
  })
})
