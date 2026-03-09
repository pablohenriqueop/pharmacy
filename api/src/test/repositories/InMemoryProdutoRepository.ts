import { Produto } from '@/domain/entities/Produto.ts'
import type { CriarProdutoInput, AtualizarProdutoInput } from '@/domain/entities/Produto.ts'
import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'
import type { PaginacaoParams, ResultadoPaginado } from '@/domain/entities/Paginacao.ts'
import { PAGINACAO_PADRAO } from '@/domain/entities/Paginacao.ts'

export class InMemoryProdutoRepository implements IProdutoRepository {
  public items: Produto[] = []

  async criar(input: CriarProdutoInput): Promise<Produto> {
    const produto = new Produto({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      nome: input.nome,
      codigoBarras: input.codigoBarras ?? null,
      categoria: input.categoria ?? null,
      laboratorio: input.laboratorio ?? null,
      precoVenda: input.precoVenda,
      precoCusto: input.precoCusto ?? null,
      unidade: input.unidade ?? 'UN',
      estoqueAtual: input.estoqueAtual ?? 0,
      estoqueMinimo: input.estoqueMinimo ?? 5,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    this.items.push(produto)
    return produto
  }

  async buscarPorId(tenantId: string, id: string): Promise<Produto | null> {
    return this.items.find(p => p.tenantId === tenantId && p.id === id) ?? null
  }

  async buscarPorCodigoBarras(tenantId: string, codigoBarras: string): Promise<Produto | null> {
    return this.items.find(p => p.tenantId === tenantId && p.codigoBarras === codigoBarras) ?? null
  }

  async listar(tenantId: string, filtros?: { nome?: string; categoria?: string; ativo?: boolean }, paginacao?: PaginacaoParams): Promise<ResultadoPaginado<Produto>> {
    const { pagina, porPagina } = paginacao ?? PAGINACAO_PADRAO
    let resultado = this.items.filter(p => p.tenantId === tenantId)

    if (filtros?.nome) {
      const termo = filtros.nome.toLowerCase()
      resultado = resultado.filter(p => p.nome.toLowerCase().includes(termo))
    }
    if (filtros?.categoria) {
      resultado = resultado.filter(p => p.categoria === filtros.categoria)
    }
    if (filtros?.ativo !== undefined) {
      resultado = resultado.filter(p => p.ativo === filtros.ativo)
    }

    const total = resultado.length
    const dados = resultado.slice((pagina - 1) * porPagina, pagina * porPagina)

    return {
      dados,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina),
    }
  }

  async listarTodos(tenantId: string, filtros?: { ativo?: boolean }): Promise<Produto[]> {
    let resultado = this.items.filter(p => p.tenantId === tenantId)
    if (filtros?.ativo !== undefined) {
      resultado = resultado.filter(p => p.ativo === filtros.ativo)
    }
    return resultado
  }

  async atualizar(tenantId: string, id: string, input: AtualizarProdutoInput): Promise<Produto | null> {
    const index = this.items.findIndex(p => p.tenantId === tenantId && p.id === id)
    if (index === -1) return null

    const atual = this.items[index]!
    const atualizado = new Produto({
      ...atual.props,
      nome: input.nome ?? atual.nome,
      codigoBarras: input.codigoBarras !== undefined ? input.codigoBarras : atual.codigoBarras,
      categoria: input.categoria !== undefined ? input.categoria : atual.categoria,
      laboratorio: input.laboratorio !== undefined ? input.laboratorio : atual.laboratorio,
      precoVenda: input.precoVenda ?? atual.precoVenda,
      precoCusto: input.precoCusto !== undefined ? input.precoCusto : atual.precoCusto,
      unidade: input.unidade ?? atual.unidade,
      estoqueAtual: input.estoqueAtual ?? atual.estoqueAtual,
      estoqueMinimo: input.estoqueMinimo ?? atual.estoqueMinimo,
      ativo: input.ativo ?? atual.ativo,
      updatedAt: new Date(),
    })

    this.items[index] = atualizado
    return atualizado
  }

  async desativar(tenantId: string, id: string): Promise<boolean> {
    const resultado = await this.atualizar(tenantId, id, { ativo: false })
    return !!resultado
  }
}
