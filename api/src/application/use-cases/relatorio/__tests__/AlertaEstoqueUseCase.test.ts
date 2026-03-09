import { describe, it, expect, beforeEach } from 'bun:test'
import { AlertaEstoqueUseCase } from '../AlertaEstoqueUseCase.ts'
import { InMemoryRelatorioRepository } from '@/test/repositories/InMemoryRelatorioRepository.ts'
import { Produto } from '@/domain/entities/Produto.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

function criarProduto(overrides: Partial<Produto['props']> = {}): Produto {
  return new Produto({
    id: crypto.randomUUID(), tenantId: TENANT, nome: 'Produto',
    codigoBarras: null, categoria: null, laboratorio: null, precoVenda: 10, precoCusto: 5,
    unidade: 'UN', estoqueAtual: 50, estoqueMinimo: 5, ativo: true,
    createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  })
}

describe('AlertaEstoqueUseCase', () => {
  let repo: InMemoryRelatorioRepository
  let sut: AlertaEstoqueUseCase

  beforeEach(() => {
    repo = new InMemoryRelatorioRepository()
    sut = new AlertaEstoqueUseCase(repo)
  })

  it('deve retornar produtos com estoque baixo', async () => {
    repo.produtos = [
      criarProduto({ nome: 'Dipirona', estoqueAtual: 3, estoqueMinimo: 5 }),
      criarProduto({ nome: 'Ibuprofeno', estoqueAtual: 50, estoqueMinimo: 5 }),
      criarProduto({ nome: 'Paracetamol', estoqueAtual: 5, estoqueMinimo: 5 }),
    ]

    const resultado = await sut.execute(TENANT)

    expect(resultado).toHaveLength(2)
    expect(resultado[0]!.nome).toBe('Dipirona')
    expect(resultado[1]!.nome).toBe('Paracetamol')
  })

  it('deve ignorar produtos inativos', async () => {
    repo.produtos = [
      criarProduto({ nome: 'Desativado', estoqueAtual: 0, estoqueMinimo: 5, ativo: false }),
      criarProduto({ nome: 'Ativo Baixo', estoqueAtual: 2, estoqueMinimo: 5 }),
    ]

    const resultado = await sut.execute(TENANT)

    expect(resultado).toHaveLength(1)
    expect(resultado[0]!.nome).toBe('Ativo Baixo')
  })

  it('deve retornar vazio quando tudo está ok', async () => {
    repo.produtos = [
      criarProduto({ estoqueAtual: 100, estoqueMinimo: 5 }),
    ]

    const resultado = await sut.execute(TENANT)
    expect(resultado).toHaveLength(0)
  })

  it('deve isolar por tenant', async () => {
    repo.produtos = [
      criarProduto({ tenantId: 'outro', estoqueAtual: 0, estoqueMinimo: 5 }),
      criarProduto({ nome: 'Meu Produto', estoqueAtual: 2, estoqueMinimo: 5 }),
    ]

    const resultado = await sut.execute(TENANT)

    expect(resultado).toHaveLength(1)
    expect(resultado[0]!.nome).toBe('Meu Produto')
  })
})
