import type { IRelatorioRepository } from '@/application/repositories/IRelatorioRepository.ts'
import type { VendaPorPeriodo, ProdutoMaisVendido, AlertaEstoque, FiltroRelatorio } from '@/domain/entities/Relatorio.ts'
import type { Venda } from '@/domain/entities/Venda.ts'
import type { Produto } from '@/domain/entities/Produto.ts'

export class InMemoryRelatorioRepository implements IRelatorioRepository {
  constructor(
    public vendas: Venda[] = [],
    public produtos: Produto[] = [],
  ) {}

  async vendasPorPeriodo(tenantId: string, filtro: FiltroRelatorio): Promise<VendaPorPeriodo[]> {
    const vendasFiltradas = this.vendas.filter(v =>
      v.tenantId === tenantId &&
      v.status === 'CONCLUIDA' &&
      v.props.createdAt >= filtro.dataInicio &&
      v.props.createdAt <= filtro.dataFim
    )

    const porData = new Map<string, VendaPorPeriodo>()

    for (const v of vendasFiltradas) {
      const data = v.props.createdAt.toISOString().split('T')[0]!
      if (!porData.has(data)) {
        porData.set(data, {
          data,
          totalVendas: 0,
          quantidadeVendas: 0,
          totalDesconto: 0,
          vendasPorFormaPagamento: {},
        })
      }

      const dia = porData.get(data)!
      dia.totalVendas += v.total
      dia.quantidadeVendas += 1
      dia.totalDesconto += v.desconto

      const fp = v.formaPagamento
      if (!dia.vendasPorFormaPagamento[fp]) {
        dia.vendasPorFormaPagamento[fp] = { quantidade: 0, total: 0 }
      }
      dia.vendasPorFormaPagamento[fp]!.quantidade += 1
      dia.vendasPorFormaPagamento[fp]!.total += v.total
    }

    return Array.from(porData.values())
  }

  async produtosMaisVendidos(tenantId: string, filtro: FiltroRelatorio, limite: number = 10): Promise<ProdutoMaisVendido[]> {
    const vendasFiltradas = this.vendas.filter(v =>
      v.tenantId === tenantId &&
      v.status === 'CONCLUIDA' &&
      v.props.createdAt >= filtro.dataInicio &&
      v.props.createdAt <= filtro.dataFim
    )

    const porProduto = new Map<string, { quantidade: number; total: number }>()

    for (const v of vendasFiltradas) {
      for (const item of v.itens) {
        const atual = porProduto.get(item.produtoId) ?? { quantidade: 0, total: 0 }
        atual.quantidade += item.quantidade
        atual.total += item.subtotal
        porProduto.set(item.produtoId, atual)
      }
    }

    const resultado: ProdutoMaisVendido[] = []

    for (const [produtoId, dados] of porProduto) {
      const produto = this.produtos.find(p => p.id === produtoId)
      resultado.push({
        produtoId,
        nome: produto?.nome ?? 'Desconhecido',
        categoria: produto?.categoria ?? null,
        quantidadeVendida: dados.quantidade,
        totalFaturado: dados.total,
      })
    }

    return resultado
      .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
      .slice(0, limite)
  }

  async alertasEstoque(tenantId: string): Promise<AlertaEstoque[]> {
    return this.produtos
      .filter(p => p.tenantId === tenantId && p.ativo && p.estoqueAtual <= p.estoqueMinimo)
      .sort((a, b) => a.estoqueAtual - b.estoqueAtual)
      .map(p => ({
        produtoId: p.id,
        nome: p.nome,
        categoria: p.categoria,
        estoqueAtual: p.estoqueAtual,
        estoqueMinimo: p.estoqueMinimo,
      }))
  }
}
