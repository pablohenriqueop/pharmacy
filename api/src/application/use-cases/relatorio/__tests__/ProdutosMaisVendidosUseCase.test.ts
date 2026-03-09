import { describe, it, expect, beforeEach } from 'bun:test'
import { ProdutosMaisVendidosUseCase } from '../ProdutosMaisVendidosUseCase.ts'
import { InMemoryRelatorioRepository } from '@/test/repositories/InMemoryRelatorioRepository.ts'
import { Venda } from '@/domain/entities/Venda.ts'
import { Produto } from '@/domain/entities/Produto.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

const produtoA = new Produto({
  id: 'p1', tenantId: TENANT, nome: 'Dipirona', codigoBarras: null, categoria: 'Analgésicos', laboratorio: null,
  precoVenda: 8.5, precoCusto: 4, unidade: 'UN', estoqueAtual: 50, estoqueMinimo: 5, ativo: true,
  createdAt: new Date(), updatedAt: new Date(),
})

const produtoB = new Produto({
  id: 'p2', tenantId: TENANT, nome: 'Ibuprofeno', codigoBarras: null, categoria: 'Anti-inflamatórios', laboratorio: null,
  precoVenda: 12, precoCusto: 6, unidade: 'UN', estoqueAtual: 30, estoqueMinimo: 5, ativo: true,
  createdAt: new Date(), updatedAt: new Date(),
})

function criarVenda(itens: { produtoId: string; quantidade: number; precoUnit: number }[]): Venda {
  const total = itens.reduce((acc, i) => acc + i.precoUnit * i.quantidade, 0)
  return new Venda({
    id: crypto.randomUUID(), tenantId: TENANT, caixaId: 'c1', total, desconto: 0,
    formaPagamento: 'DINHEIRO', valorPago: total, troco: 0, status: 'CONCLUIDA',
    nfceChave: null, createdAt: new Date('2026-03-01T10:00:00'),
    itens: itens.map(i => ({
      id: crypto.randomUUID(), vendaId: '', produtoId: i.produtoId,
      quantidade: i.quantidade, precoUnit: i.precoUnit, subtotal: i.precoUnit * i.quantidade,
    })),
  })
}

describe('ProdutosMaisVendidosUseCase', () => {
  let repo: InMemoryRelatorioRepository
  let sut: ProdutosMaisVendidosUseCase

  beforeEach(() => {
    repo = new InMemoryRelatorioRepository([], [produtoA, produtoB])
    sut = new ProdutosMaisVendidosUseCase(repo)
  })

  it('deve retornar ranking ordenado por quantidade', async () => {
    repo.vendas = [
      criarVenda([{ produtoId: 'p1', quantidade: 10, precoUnit: 8.5 }]),
      criarVenda([{ produtoId: 'p2', quantidade: 3, precoUnit: 12 }]),
      criarVenda([{ produtoId: 'p1', quantidade: 5, precoUnit: 8.5 }]),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-02'),
    })

    expect(resultado).toHaveLength(2)
    expect(resultado[0]!.produtoId).toBe('p1')
    expect(resultado[0]!.quantidadeVendida).toBe(15)
    expect(resultado[0]!.totalFaturado).toBe(127.5)
    expect(resultado[1]!.produtoId).toBe('p2')
    expect(resultado[1]!.quantidadeVendida).toBe(3)
  })

  it('deve respeitar o limite', async () => {
    repo.vendas = [
      criarVenda([
        { produtoId: 'p1', quantidade: 10, precoUnit: 8.5 },
        { produtoId: 'p2', quantidade: 5, precoUnit: 12 },
      ]),
    ]

    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-02'),
    }, 1)

    expect(resultado).toHaveLength(1)
    expect(resultado[0]!.produtoId).toBe('p1')
  })

  it('deve retornar vazio sem vendas no período', async () => {
    const resultado = await sut.execute(TENANT, {
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-03-02'),
    })

    expect(resultado).toHaveLength(0)
  })
})
