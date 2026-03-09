import { Venda } from '@/domain/entities/Venda.ts'
import type { CriarVendaInput, FormaPagamento, ItemVendaProps } from '@/domain/entities/Venda.ts'
import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'
import type { PaginacaoParams, ResultadoPaginado } from '@/domain/entities/Paginacao.ts'
import { PAGINACAO_PADRAO } from '@/domain/entities/Paginacao.ts'

export class InMemoryVendaRepository implements IVendaRepository {
  public items: Venda[] = []

  async criar(input: CriarVendaInput & { total: number; troco: number | null }): Promise<Venda> {
    const vendaId = crypto.randomUUID()

    const itens: ItemVendaProps[] = input.itens.map(item => ({
      id: crypto.randomUUID(),
      vendaId,
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnit: item.precoUnit,
      subtotal: item.precoUnit * item.quantidade,
    }))

    const venda = new Venda({
      id: vendaId,
      tenantId: input.tenantId,
      caixaId: input.caixaId,
      total: input.total,
      desconto: input.desconto ?? 0,
      formaPagamento: input.formaPagamento as FormaPagamento,
      valorPago: input.valorPago ?? null,
      troco: input.troco,
      status: 'CONCLUIDA',
      nfceChave: null,
      createdAt: new Date(),
      itens,
    })

    this.items.push(venda)
    return venda
  }

  async buscarPorId(tenantId: string, id: string): Promise<Venda | null> {
    return this.items.find(v => v.tenantId === tenantId && v.id === id) ?? null
  }

  async listarPorCaixa(tenantId: string, caixaId: string, paginacao?: PaginacaoParams): Promise<ResultadoPaginado<Venda>> {
    const { pagina, porPagina } = paginacao ?? PAGINACAO_PADRAO
    const todos = this.items.filter(v => v.tenantId === tenantId && v.caixaId === caixaId)
    const total = todos.length
    const dados = todos.slice((pagina - 1) * porPagina, pagina * porPagina)

    return {
      dados,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina),
    }
  }

  async cancelar(tenantId: string, id: string): Promise<Venda | null> {
    const index = this.items.findIndex(v => v.tenantId === tenantId && v.id === id)
    if (index === -1) return null

    const atual = this.items[index]!
    const cancelada = new Venda({
      ...atual.props,
      status: 'CANCELADA',
    })

    this.items[index] = cancelada
    return cancelada
  }

  async atualizarNfceChave(tenantId: string, id: string, nfceChave: string): Promise<void> {
    const index = this.items.findIndex(v => v.tenantId === tenantId && v.id === id)
    if (index === -1) return

    const atual = this.items[index]!
    this.items[index] = new Venda({
      ...atual.props,
      nfceChave,
    })
  }
}
