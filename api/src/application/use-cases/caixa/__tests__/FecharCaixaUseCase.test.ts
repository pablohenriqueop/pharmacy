import { describe, it, expect, beforeEach } from 'bun:test'
import { FecharCaixaUseCase } from '../FecharCaixaUseCase.ts'
import { InMemoryCaixaRepository } from '@/test/repositories/InMemoryCaixaRepository.ts'
import { CaixaNaoEncontradoError, CaixaJaFechadoError } from '@/domain/errors/CaixaErrors.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('FecharCaixaUseCase', () => {
  let repo: InMemoryCaixaRepository
  let sut: FecharCaixaUseCase

  beforeEach(() => {
    repo = new InMemoryCaixaRepository()
    sut = new FecharCaixaUseCase(repo)
  })

  it('deve fechar um caixa aberto', async () => {
    const aberto = await repo.abrir({ tenantId: TENANT, valorAbertura: 100.0 })

    const fechado = await sut.execute(TENANT, aberto.id, 850.0)

    expect(fechado.status).toBe('FECHADO')
    expect(fechado.valorFechamento).toBe(850.0)
    expect(fechado.fechamentoEm).not.toBeNull()
  })

  it('deve lançar erro ao fechar caixa inexistente', async () => {
    expect(
      sut.execute(TENANT, 'id-inexistente', 100.0)
    ).rejects.toBeInstanceOf(CaixaNaoEncontradoError)
  })

  it('deve lançar erro ao fechar caixa já fechado', async () => {
    const aberto = await repo.abrir({ tenantId: TENANT, valorAbertura: 100.0 })
    await repo.fechar(TENANT, aberto.id, 500.0)

    expect(
      sut.execute(TENANT, aberto.id, 500.0)
    ).rejects.toBeInstanceOf(CaixaJaFechadoError)
  })
})
