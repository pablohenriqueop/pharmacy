import { describe, it, expect, beforeEach } from 'bun:test'
import { BuscarConfiguracaoUseCase } from '../BuscarConfiguracaoUseCase.ts'
import { InMemoryConfiguracaoRepository } from '@/test/repositories/InMemoryConfiguracaoRepository.ts'
import { ConfiguracaoNaoEncontradaError } from '@/domain/errors/ConfiguracaoErrors.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('BuscarConfiguracaoUseCase', () => {
  let repo: InMemoryConfiguracaoRepository
  let sut: BuscarConfiguracaoUseCase

  beforeEach(() => {
    repo = new InMemoryConfiguracaoRepository()
    sut = new BuscarConfiguracaoUseCase(repo)
  })

  it('deve buscar configuração existente', async () => {
    await repo.criarOuAtualizar({ tenantId: TENANT, nomeFarmacia: 'Farmácia Saúde' })

    const config = await sut.execute(TENANT)
    expect(config.nomeFarmacia).toBe('Farmácia Saúde')
    expect(config.corPrimaria).toBe('#0095DA')
  })

  it('deve rejeitar tenant sem configuração', async () => {
    expect(
      sut.execute(TENANT)
    ).rejects.toBeInstanceOf(ConfiguracaoNaoEncontradaError)
  })
})
