import { describe, it, expect, beforeEach } from 'bun:test'
import { CadastrarProdutoUseCase } from '../CadastrarProdutoUseCase.ts'
import { InMemoryProdutoRepository } from '@/test/repositories/InMemoryProdutoRepository.ts'
import { CodigoBarrasDuplicadoError } from '@/domain/errors/ProdutoErrors.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('CadastrarProdutoUseCase', () => {
  let repo: InMemoryProdutoRepository
  let sut: CadastrarProdutoUseCase

  beforeEach(() => {
    repo = new InMemoryProdutoRepository()
    sut = new CadastrarProdutoUseCase(repo)
  })

  it('deve cadastrar um produto com sucesso', async () => {
    const produto = await sut.execute({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
      codigoBarras: '7891234567890',
    })

    expect(produto.nome).toBe('Dipirona 500mg')
    expect(produto.precoVenda).toBe(8.5)
    expect(produto.codigoBarras).toBe('7891234567890')
    expect(produto.unidade).toBe('UN')
    expect(produto.estoqueAtual).toBe(0)
    expect(produto.estoqueMinimo).toBe(5)
    expect(produto.ativo).toBe(true)
    expect(repo.items).toHaveLength(1)
  })

  it('deve cadastrar produto sem código de barras', async () => {
    const produto = await sut.execute({
      tenantId: TENANT,
      nome: 'Produto Manipulado',
      precoVenda: 25.0,
    })

    expect(produto.codigoBarras).toBeNull()
  })

  it('deve rejeitar código de barras duplicado no mesmo tenant', async () => {
    await sut.execute({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
      codigoBarras: '7891234567890',
    })

    expect(
      sut.execute({
        tenantId: TENANT,
        nome: 'Outro Produto',
        precoVenda: 10.0,
        codigoBarras: '7891234567890',
      })
    ).rejects.toBeInstanceOf(CodigoBarrasDuplicadoError)
  })

  it('deve permitir mesmo código de barras em tenants diferentes', async () => {
    const outroTenant = '00000000-0000-0000-0000-000000000002'

    await sut.execute({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
      codigoBarras: '7891234567890',
    })

    const produto = await sut.execute({
      tenantId: outroTenant,
      nome: 'Dipirona 500mg',
      precoVenda: 9.0,
      codigoBarras: '7891234567890',
    })

    expect(produto.codigoBarras).toBe('7891234567890')
    expect(repo.items).toHaveLength(2)
  })
})
