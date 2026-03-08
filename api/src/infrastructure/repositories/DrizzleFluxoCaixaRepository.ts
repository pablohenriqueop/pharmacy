import { eq, and, between, sql } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { vendas, contas } from '@/infrastructure/db/schema.ts'
import type { IFluxoCaixaRepository } from '@/application/repositories/IFluxoCaixaRepository.ts'
import type { FluxoCaixaItem } from '@/domain/entities/Conta.ts'
import type { FiltroRelatorio } from '@/domain/entities/Relatorio.ts'

export class DrizzleFluxoCaixaRepository implements IFluxoCaixaRepository {
  async fluxoPorPeriodo(tenantId: string, filtro: FiltroRelatorio): Promise<FluxoCaixaItem[]> {
    // Entradas: vendas concluídas
    const entradasRows = await db
      .select({
        data: sql<string>`DATE(${vendas.createdAt})`.as('data'),
        total: sql<string>`SUM(${vendas.total})`.as('total'),
      })
      .from(vendas)
      .where(and(
        eq(vendas.tenantId, tenantId),
        eq(vendas.status, 'CONCLUIDA'),
        between(vendas.createdAt, filtro.dataInicio, filtro.dataFim),
      ))
      .groupBy(sql`DATE(${vendas.createdAt})`)

    // Saídas: contas pagas
    const saidasRows = await db
      .select({
        data: sql<string>`DATE(${contas.dataPagamento})`.as('data'),
        total: sql<string>`SUM(${contas.valor})`.as('total'),
      })
      .from(contas)
      .where(and(
        eq(contas.tenantId, tenantId),
        eq(contas.status, 'PAGA'),
        eq(contas.tipo, 'PAGAR'),
        between(contas.dataPagamento, filtro.dataInicio, filtro.dataFim),
      ))
      .groupBy(sql`DATE(${contas.dataPagamento})`)

    // Recebimentos extras: contas a receber pagas
    const recebimentosRows = await db
      .select({
        data: sql<string>`DATE(${contas.dataPagamento})`.as('data'),
        total: sql<string>`SUM(${contas.valor})`.as('total'),
      })
      .from(contas)
      .where(and(
        eq(contas.tenantId, tenantId),
        eq(contas.status, 'PAGA'),
        eq(contas.tipo, 'RECEBER'),
        between(contas.dataPagamento, filtro.dataInicio, filtro.dataFim),
      ))
      .groupBy(sql`DATE(${contas.dataPagamento})`)

    // Consolida por data
    const porData = new Map<string, FluxoCaixaItem>()

    for (const row of entradasRows) {
      const item = porData.get(row.data) ?? { data: row.data, entradas: 0, saidas: 0, saldo: 0 }
      item.entradas += Number(row.total)
      porData.set(row.data, item)
    }

    for (const row of recebimentosRows) {
      const item = porData.get(row.data) ?? { data: row.data, entradas: 0, saidas: 0, saldo: 0 }
      item.entradas += Number(row.total)
      porData.set(row.data, item)
    }

    for (const row of saidasRows) {
      const item = porData.get(row.data) ?? { data: row.data, entradas: 0, saidas: 0, saldo: 0 }
      item.saidas += Number(row.total)
      porData.set(row.data, item)
    }

    // Calcula saldo
    const resultado = Array.from(porData.values()).sort((a, b) => a.data.localeCompare(b.data))
    for (const item of resultado) {
      item.saldo = item.entradas - item.saidas
    }

    return resultado
  }
}
