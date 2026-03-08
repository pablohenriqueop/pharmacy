import { eq, and, between, sql, lte } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { vendas, itensVenda, produtos } from '@/infrastructure/db/schema.ts'
import type { IRelatorioRepository } from '@/application/repositories/IRelatorioRepository.ts'
import type { VendaPorPeriodo, ProdutoMaisVendido, AlertaEstoque, FiltroRelatorio } from '@/domain/entities/Relatorio.ts'

export class DrizzleRelatorioRepository implements IRelatorioRepository {
  async vendasPorPeriodo(tenantId: string, filtro: FiltroRelatorio): Promise<VendaPorPeriodo[]> {
    const rows = await db
      .select({
        data: sql<string>`DATE(${vendas.createdAt})`.as('data'),
        formaPagamento: vendas.formaPagamento,
        totalVendas: sql<string>`SUM(${vendas.total})`.as('total_vendas'),
        quantidadeVendas: sql<number>`COUNT(*)`.as('quantidade_vendas'),
        totalDesconto: sql<string>`SUM(${vendas.desconto})`.as('total_desconto'),
      })
      .from(vendas)
      .where(and(
        eq(vendas.tenantId, tenantId),
        eq(vendas.status, 'CONCLUIDA'),
        between(vendas.createdAt, filtro.dataInicio, filtro.dataFim),
      ))
      .groupBy(sql`DATE(${vendas.createdAt})`, vendas.formaPagamento)
      .orderBy(sql`DATE(${vendas.createdAt})`)

    // Agrupa por data
    const porData = new Map<string, VendaPorPeriodo>()

    for (const row of rows) {
      const data = row.data
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
      const total = Number(row.totalVendas)
      const qtd = Number(row.quantidadeVendas)
      const desconto = Number(row.totalDesconto)

      dia.totalVendas += total
      dia.quantidadeVendas += qtd
      dia.totalDesconto += desconto
      dia.vendasPorFormaPagamento[row.formaPagamento] = {
        quantidade: qtd,
        total,
      }
    }

    return Array.from(porData.values())
  }

  async produtosMaisVendidos(tenantId: string, filtro: FiltroRelatorio, limite: number = 10): Promise<ProdutoMaisVendido[]> {
    const rows = await db
      .select({
        produtoId: itensVenda.produtoId,
        nome: produtos.nome,
        categoria: produtos.categoria,
        quantidadeVendida: sql<number>`SUM(${itensVenda.quantidade})`.as('quantidade_vendida'),
        totalFaturado: sql<string>`SUM(${itensVenda.subtotal})`.as('total_faturado'),
      })
      .from(itensVenda)
      .innerJoin(vendas, eq(itensVenda.vendaId, vendas.id))
      .innerJoin(produtos, eq(itensVenda.produtoId, produtos.id))
      .where(and(
        eq(vendas.tenantId, tenantId),
        eq(vendas.status, 'CONCLUIDA'),
        between(vendas.createdAt, filtro.dataInicio, filtro.dataFim),
      ))
      .groupBy(itensVenda.produtoId, produtos.nome, produtos.categoria)
      .orderBy(sql`SUM(${itensVenda.quantidade}) DESC`)
      .limit(limite)

    return rows.map(row => ({
      produtoId: row.produtoId,
      nome: row.nome,
      categoria: row.categoria,
      quantidadeVendida: Number(row.quantidadeVendida),
      totalFaturado: Number(row.totalFaturado),
    }))
  }

  async alertasEstoque(tenantId: string): Promise<AlertaEstoque[]> {
    const rows = await db
      .select({
        produtoId: produtos.id,
        nome: produtos.nome,
        categoria: produtos.categoria,
        estoqueAtual: produtos.estoqueAtual,
        estoqueMinimo: produtos.estoqueMinimo,
      })
      .from(produtos)
      .where(and(
        eq(produtos.tenantId, tenantId),
        eq(produtos.ativo, true),
        lte(produtos.estoqueAtual, produtos.estoqueMinimo),
      ))
      .orderBy(produtos.estoqueAtual)

    return rows.map(row => ({
      produtoId: row.produtoId,
      nome: row.nome,
      categoria: row.categoria,
      estoqueAtual: row.estoqueAtual,
      estoqueMinimo: row.estoqueMinimo,
    }))
  }
}
