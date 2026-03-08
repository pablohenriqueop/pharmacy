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
    const produtos = await sut.execute(TENANT)
    expect(produtos).toHaveLength(3)
  })

  it('deve filtrar por nome parcial', async () => {
    const produtos = await sut.execute(TENANT, { nome: 'dipirona' })
    expect(produtos).toHaveLength(2)
  })

  it('deve filtrar por categoria', async () => {
    const produtos = await sut.execute(TENANT, { categoria: 'Analgésicos' })
    expect(produtos).toHaveLength(2)
  })

  it('deve filtrar por ativo', async () => {
    await repo.desativar(TENANT, repo.items[0]!.id)

    const ativos = await sut.execute(TENANT, { ativo: true })
    expect(ativos).toHaveLength(2)

    const inativos = await sut.execute(TENANT, { ativo: false })
    expect(inativos).toHaveLength(1)
  })

  it('não deve retornar produtos de outro tenant', async () => {
    const outroTenant = '00000000-0000-0000-0000-000000000002'
    const produtos = await sut.execute(outroTenant)
    expect(produtos).toHaveLength(0)
  })
})
