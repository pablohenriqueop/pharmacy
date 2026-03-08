import { describe, it, expect, beforeEach } from 'bun:test'
import { AtualizarProdutoUseCase } from '../AtualizarProdutoUseCase.ts'
import { InMemoryProdutoRepository } from '@/test/repositories/InMemoryProdutoRepository.ts'
import { ProdutoNaoEncontradoError, CodigoBarrasDuplicadoError } from '@/domain/errors/ProdutoErrors.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('AtualizarProdutoUseCase', () => {
  let repo: InMemoryProdutoRepository
  let sut: AtualizarProdutoUseCase

  beforeEach(() => {
    repo = new InMemoryProdutoRepository()
    sut = new AtualizarProdutoUseCase(repo)
  })

  it('deve atualizar nome e preço', async () => {
    const criado = await repo.criar({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
    })

    const atualizado = await sut.execute(TENANT, criado.id, {
      nome: 'Dipirona Sódica 500mg',
      precoVenda: 9.0,
    })

    expect(atualizado.nome).toBe('Dipirona Sódica 500mg')
    expect(atualizado.precoVenda).toBe(9.0)
  })

  it('deve lançar erro ao atualizar produto inexistente', async () => {
    expect(
      sut.execute(TENANT, 'id-inexistente', { nome: 'Teste' })
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoError)
  })

  it('deve rejeitar código de barras duplicado na atualização', async () => {
    await repo.criar({
      tenantId: TENANT,
      nome: 'Produto A',
      precoVenda: 10.0,
      codigoBarras: '1111111111111',
    })

    const produtoB = await repo.criar({
      tenantId: TENANT,
      nome: 'Produto B',
      precoVenda: 20.0,
      codigoBarras: '2222222222222',
    })

    expect(
      sut.execute(TENANT, produtoB.id, { codigoBarras: '1111111111111' })
    ).rejects.toBeInstanceOf(CodigoBarrasDuplicadoError)
  })

  it('deve permitir manter o mesmo código de barras ao atualizar', async () => {
    const criado = await repo.criar({
      tenantId: TENANT,
      nome: 'Produto A',
      precoVenda: 10.0,
      codigoBarras: '1111111111111',
    })

    const atualizado = await sut.execute(TENANT, criado.id, {
      nome: 'Produto A Atualizado',
      codigoBarras: '1111111111111',
    })

    expect(atualizado.nome).toBe('Produto A Atualizado')
    expect(atualizado.codigoBarras).toBe('1111111111111')
  })
})
