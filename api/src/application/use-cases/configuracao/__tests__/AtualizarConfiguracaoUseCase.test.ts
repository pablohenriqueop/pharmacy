import { describe, it, expect, beforeEach } from 'bun:test'
import { AtualizarConfiguracaoUseCase } from '../AtualizarConfiguracaoUseCase.ts'
import { InMemoryConfiguracaoRepository } from '@/test/repositories/InMemoryConfiguracaoRepository.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('AtualizarConfiguracaoUseCase', () => {
  let repo: InMemoryConfiguracaoRepository
  let sut: AtualizarConfiguracaoUseCase

  beforeEach(() => {
    repo = new InMemoryConfiguracaoRepository()
    sut = new AtualizarConfiguracaoUseCase(repo)
  })

  it('deve criar configuração quando não existe', async () => {
    const config = await sut.execute({
      tenantId: TENANT,
      nomeFarmacia: 'Farmácia Saúde',
      corPrimaria: '#FF5500',
    })

    expect(config.nomeFarmacia).toBe('Farmácia Saúde')
    expect(config.corPrimaria).toBe('#FF5500')
    expect(config.corSecundaria).toBe('#FFFFFF')
    expect(repo.items).toHaveLength(1)
  })

  it('deve atualizar configuração existente', async () => {
    await sut.execute({ tenantId: TENANT, nomeFarmacia: 'Farmácia Saúde' })

    const atualizada = await sut.execute({
      tenantId: TENANT,
      nomeFarmacia: 'Farmácia Saúde Plus',
      corPrimaria: '#00AA00',
    })

    expect(atualizada.nomeFarmacia).toBe('Farmácia Saúde Plus')
    expect(atualizada.corPrimaria).toBe('#00AA00')
    expect(repo.items).toHaveLength(1)
  })

  it('deve manter cores padrão quando não fornecidas', async () => {
    const config = await sut.execute({
      tenantId: TENANT,
      nomeFarmacia: 'Farmácia Teste',
    })

    expect(config.corPrimaria).toBe('#0095DA')
    expect(config.corSecundaria).toBe('#FFFFFF')
  })
})
