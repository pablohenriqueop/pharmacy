import { describe, it, expect, beforeEach } from 'bun:test'
import { BuscarProdutoUseCase } from '../BuscarProdutoUseCase.ts'
import { InMemoryProdutoRepository } from '@/test/repositories/InMemoryProdutoRepository.ts'
import { ProdutoNaoEncontradoError } from '@/domain/errors/ProdutoErrors.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('BuscarProdutoUseCase', () => {
  let repo: InMemoryProdutoRepository
  let sut: BuscarProdutoUseCase

  beforeEach(() => {
    repo = new InMemoryProdutoRepository()
    sut = new BuscarProdutoUseCase(repo)
  })

  it('deve buscar produto por id', async () => {
    const criado = await repo.criar({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
    })

    const produto = await sut.porId(TENANT, criado.id)
    expect(produto.nome).toBe('Dipirona 500mg')
  })

  it('deve lançar erro ao buscar id inexistente', async () => {
    expect(
      sut.porId(TENANT, 'id-inexistente')
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoError)
  })

  it('deve buscar produto por código de barras', async () => {
    await repo.criar({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
      codigoBarras: '7891234567890',
    })

    const produto = await sut.porCodigoBarras(TENANT, '7891234567890')
    expect(produto.nome).toBe('Dipirona 500mg')
  })

  it('deve lançar erro ao buscar código de barras inexistente', async () => {
    expect(
      sut.porCodigoBarras(TENANT, '0000000000000')
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoError)
  })
})
