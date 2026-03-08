import { describe, it, expect, beforeEach } from 'bun:test'
import { CriarVendaUseCase } from '../CriarVendaUseCase.ts'
import { InMemoryVendaRepository } from '@/test/repositories/InMemoryVendaRepository.ts'
import { InMemoryProdutoRepository } from '@/test/repositories/InMemoryProdutoRepository.ts'
import { InMemoryCaixaRepository } from '@/test/repositories/InMemoryCaixaRepository.ts'
import { EstoqueInsuficienteError, VendaSemItensError } from '@/domain/errors/VendaErrors.ts'
import { CaixaNaoEncontradoError, CaixaJaFechadoError } from '@/domain/errors/CaixaErrors.ts'
import { ProdutoNaoEncontradoError } from '@/domain/errors/ProdutoErrors.ts'
import type { Produto } from '@/domain/entities/Produto.ts'
import type { Caixa } from '@/domain/entities/Caixa.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('CriarVendaUseCase', () => {
  let vendaRepo: InMemoryVendaRepository
  let produtoRepo: InMemoryProdutoRepository
  let caixaRepo: InMemoryCaixaRepository
  let sut: CriarVendaUseCase
  let produto: Produto
  let caixa: Caixa

  beforeEach(async () => {
    vendaRepo = new InMemoryVendaRepository()
    produtoRepo = new InMemoryProdutoRepository()
    caixaRepo = new InMemoryCaixaRepository()
    sut = new CriarVendaUseCase(vendaRepo, produtoRepo, caixaRepo)

    produto = await produtoRepo.criar({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
      estoqueAtual: 50,
    })

    caixa = await caixaRepo.abrir({ tenantId: TENANT, valorAbertura: 100.0 })
  })

  it('deve criar uma venda com sucesso', async () => {
    const venda = await sut.execute({
      tenantId: TENANT,
      caixaId: caixa.id,
      formaPagamento: 'DINHEIRO',
      valorPago: 20.0,
      itens: [{ produtoId: produto.id, quantidade: 2, precoUnit: 8.5 }],
    })

    expect(venda.total).toBe(17.0)
    expect(venda.troco).toBe(3.0)
    expect(venda.status).toBe('CONCLUIDA')
    expect(venda.itens).toHaveLength(1)
  })

  it('deve decrementar estoque após venda', async () => {
    await sut.execute({
      tenantId: TENANT,
      caixaId: caixa.id,
      formaPagamento: 'PIX',
      itens: [{ produtoId: produto.id, quantidade: 3, precoUnit: 8.5 }],
    })

    const atualizado = await produtoRepo.buscarPorId(TENANT, produto.id)
    expect(atualizado!.estoqueAtual).toBe(47)
  })

  it('deve aplicar desconto corretamente', async () => {
    const venda = await sut.execute({
      tenantId: TENANT,
      caixaId: caixa.id,
      formaPagamento: 'CARTAO_CREDITO',
      desconto: 5.0,
      itens: [{ produtoId: produto.id, quantidade: 2, precoUnit: 8.5 }],
    })

    expect(venda.total).toBe(12.0)
    expect(venda.desconto).toBe(5.0)
  })

  it('não deve calcular troco para pagamento não-dinheiro', async () => {
    const venda = await sut.execute({
      tenantId: TENANT,
      caixaId: caixa.id,
      formaPagamento: 'PIX',
      itens: [{ produtoId: produto.id, quantidade: 1, precoUnit: 8.5 }],
    })

    expect(venda.troco).toBeNull()
  })

  it('deve rejeitar venda sem itens', async () => {
    expect(
      sut.execute({
        tenantId: TENANT,
        caixaId: caixa.id,
        formaPagamento: 'DINHEIRO',
        itens: [],
      })
    ).rejects.toBeInstanceOf(VendaSemItensError)
  })

  it('deve rejeitar venda com estoque insuficiente', async () => {
    expect(
      sut.execute({
        tenantId: TENANT,
        caixaId: caixa.id,
        formaPagamento: 'DINHEIRO',
        itens: [{ produtoId: produto.id, quantidade: 999, precoUnit: 8.5 }],
      })
    ).rejects.toBeInstanceOf(EstoqueInsuficienteError)
  })

  it('deve rejeitar venda com caixa inexistente', async () => {
    expect(
      sut.execute({
        tenantId: TENANT,
        caixaId: 'caixa-inexistente',
        formaPagamento: 'DINHEIRO',
        itens: [{ produtoId: produto.id, quantidade: 1, precoUnit: 8.5 }],
      })
    ).rejects.toBeInstanceOf(CaixaNaoEncontradoError)
  })

  it('deve rejeitar venda com caixa fechado', async () => {
    await caixaRepo.fechar(TENANT, caixa.id, 500.0)

    expect(
      sut.execute({
        tenantId: TENANT,
        caixaId: caixa.id,
        formaPagamento: 'DINHEIRO',
        itens: [{ produtoId: produto.id, quantidade: 1, precoUnit: 8.5 }],
      })
    ).rejects.toBeInstanceOf(CaixaJaFechadoError)
  })

  it('deve rejeitar venda com produto inexistente', async () => {
    expect(
      sut.execute({
        tenantId: TENANT,
        caixaId: caixa.id,
        formaPagamento: 'DINHEIRO',
        itens: [{ produtoId: 'produto-inexistente', quantidade: 1, precoUnit: 8.5 }],
      })
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoError)
  })
})
