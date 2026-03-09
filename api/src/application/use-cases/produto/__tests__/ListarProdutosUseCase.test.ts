import { describe, it, expect, beforeEach } from 'bun:test'
import { ListarProdutosUseCase } from '../ListarProdutosUseCase.ts'
import { InMemoryProdutoRepository } from '@/test/repositories/InMemoryProdutoRepository.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('ListarProdutosUseCase', () => {
  let repo: InMemoryProdutoRepository
  let sut: ListarProdutosUseCase

  beforeEach(async () => {
    repo = new InMemoryProdutoRepository()
    sut = new ListarProdutosUseCase(repo)

    await repo.criar({ tenantId: TENANT, nome: 'Dipirona 500mg', precoVenda: 8.5, categoria: 'Analgésicos' })
    await repo.criar({ tenantId: TENANT, nome: 'Ibuprofeno 400mg', precoVenda: 12.0, categoria: 'Anti-inflamatórios' })
    await repo.criar({ tenantId: TENANT, nome: 'Dipirona Gotas', precoVenda: 15.0, categoria: 'Analgésicos' })
  })

  it('deve listar todos os produtos do tenant', async () => {
    const resultado = await sut.execute(TENANT)
    expect(resultado.dados).toHaveLength(3)
    expect(resultado.total).toBe(3)
    expect(resultado.pagina).toBe(1)
    expect(resultado.porPagina).toBe(30)
  })

  it('deve filtrar por nome parcial', async () => {
    const resultado = await sut.execute(TENANT, { nome: 'dipirona' })
    expect(resultado.dados).toHaveLength(2)
  })

  it('deve filtrar por categoria', async () => {
    const resultado = await sut.execute(TENANT, { categoria: 'Analgésicos' })
    expect(resultado.dados).toHaveLength(2)
  })

  it('deve filtrar por ativo', async () => {
    await repo.desativar(TENANT, repo.items[0]!.id)

    const ativos = await sut.execute(TENANT, { ativo: true })
    expect(ativos.dados).toHaveLength(2)

    const inativos = await sut.execute(TENANT, { ativo: false })
    expect(inativos.dados).toHaveLength(1)
  })

  it('não deve retornar produtos de outro tenant', async () => {
    const outroTenant = '00000000-0000-0000-0000-000000000002'
    const resultado = await sut.execute(outroTenant)
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
