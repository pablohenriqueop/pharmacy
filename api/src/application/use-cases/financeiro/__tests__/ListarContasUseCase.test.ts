import { describe, it, expect, beforeEach } from 'bun:test'
import { ListarContasUseCase } from '../ListarContasUseCase.ts'
import { InMemoryContaRepository } from '@/test/repositories/InMemoryContaRepository.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('ListarContasUseCase', () => {
  let repo: InMemoryContaRepository
  let sut: ListarContasUseCase

  beforeEach(async () => {
    repo = new InMemoryContaRepository()
    sut = new ListarContasUseCase(repo)

    await repo.criar({ tenantId: TENANT, tipo: 'PAGAR', descricao: 'Fornecedor A', valor: 500, dataVencimento: new Date('2026-03-10') })
    await repo.criar({ tenantId: TENANT, tipo: 'RECEBER', descricao: 'Cliente B', valor: 200, dataVencimento: new Date('2026-03-15') })
    await repo.criar({ tenantId: TENANT, tipo: 'PAGAR', descricao: 'Fornecedor C', valor: 300, dataVencimento: new Date('2026-03-20') })
  })

  it('deve listar todas as contas do tenant', async () => {
    const resultado = await sut.execute(TENANT)
    expect(resultado.dados).toHaveLength(3)
    expect(resultado.total).toBe(3)
  })

  it('deve filtrar por tipo', async () => {
    const pagar = await sut.execute(TENANT, { tipo: 'PAGAR' })
    expect(pagar.dados).toHaveLength(2)

    const receber = await sut.execute(TENANT, { tipo: 'RECEBER' })
    expect(receber.dados).toHaveLength(1)
  })

  it('deve filtrar por status', async () => {
    await repo.pagar(TENANT, repo.items[0]!.id)

    const pagas = await sut.execute(TENANT, { status: 'PAGA' })
    expect(pagas.dados).toHaveLength(1)

    const pendentes = await sut.execute(TENANT, { status: 'PENDENTE' })
    expect(pendentes.dados).toHaveLength(2)
  })

  it('deve filtrar por período de vencimento', async () => {
    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-10'),
      dataFim: new Date('2026-03-16'),
    })
    expect(resultado.dados).toHaveLength(2)
  })

  it('deve isolar por tenant', async () => {
    const resultado = await sut.execute('outro-tenant')
    expect(resultado.dados).toHaveLength(0)
    expect(resultado.total).toBe(0)
  })

  it('deve paginar corretamente', async () => {
    const pagina1 = await sut.execute(TENANT, undefined, { pagina: 1, porPagina: 2 })
    expect(pagina1.dados).toHaveLength(2)
    expect(pagina1.total).toBe(3)
    expect(pagina1.totalPaginas).toBe(2)

    const pagina2 = await sut.execute(TENANT, undefined, { pagina: 2, porPagina: 2 })
    expect(pagina2.dados).toHaveLength(1)
  })
})
