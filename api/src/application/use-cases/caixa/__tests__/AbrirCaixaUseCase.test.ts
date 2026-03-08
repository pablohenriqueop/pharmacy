import { describe, it, expect, beforeEach } from 'bun:test'
import { AbrirCaixaUseCase } from '../AbrirCaixaUseCase.ts'
import { InMemoryCaixaRepository } from '@/test/repositories/InMemoryCaixaRepository.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('AbrirCaixaUseCase', () => {
  let repo: InMemoryCaixaRepository
  let sut: AbrirCaixaUseCase

  beforeEach(() => {
    repo = new InMemoryCaixaRepository()
    sut = new AbrirCaixaUseCase(repo)
  })

  it('deve abrir um caixa com sucesso', async () => {
    const caixa = await sut.execute(TENANT, 100.0)

    expect(caixa.valorAbertura).toBe(100.0)
    expect(caixa.status).toBe('ABERTO')
    expect(caixa.valorFechamento).toBeNull()
    expect(caixa.fechamentoEm).toBeNull()
    expect(repo.items).toHaveLength(1)
  })

  it('deve retornar caixa já aberto em vez de criar outro', async () => {
    const primeiro = await sut.execute(TENANT, 100.0)
    const segundo = await sut.execute(TENANT, 200.0)

    expect(segundo.id).toBe(primeiro.id)
    expect(segundo.valorAbertura).toBe(100.0)
    expect(repo.items).toHaveLength(1)
  })
})
