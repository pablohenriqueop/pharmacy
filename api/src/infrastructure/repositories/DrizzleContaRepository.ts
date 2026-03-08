import { eq, and, between } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { contas } from '@/infrastructure/db/schema.ts'
import { Conta } from '@/domain/entities/Conta.ts'
import type { CriarContaInput, TipoConta, StatusConta } from '@/domain/entities/Conta.ts'
import type { IContaRepository, FiltroContas } from '@/application/repositories/IContaRepository.ts'

function toConta(row: typeof contas.$inferSelect): Conta {
  return new Conta({
    id: row.id,
    tenantId: row.tenantId,
    tipo: row.tipo as TipoConta,
    descricao: row.descricao,
    valor: Number(row.valor),
    categoria: row.categoria,
    dataVencimento: row.dataVencimento,
    dataPagamento: row.dataPagamento,
    status: row.status as StatusConta,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class DrizzleContaRepository implements IContaRepository {
  async criar(input: CriarContaInput): Promise<Conta> {
    const [row] = await db.insert(contas).values({
      tenantId: input.tenantId,
      tipo: input.tipo,
      descricao: input.descricao,
      valor: String(input.valor),
      categoria: input.categoria ?? null,
      dataVencimento: input.dataVencimento,
      status: 'PENDENTE',
    }).returning()

    return toConta(row!)
  }

  async buscarPorId(tenantId: string, id: string): Promise<Conta | null> {
    const [row] = await db
      .select()
      .from(contas)
      .where(and(eq(contas.tenantId, tenantId), eq(contas.id, id)))

    return row ? toConta(row) : null
  }

  async listar(tenantId: string, filtros?: FiltroContas): Promise<Conta[]> {
    const conditions = [eq(contas.tenantId, tenantId)]

    if (filtros?.tipo) {
      conditions.push(eq(contas.tipo, filtros.tipo))
    }
    if (filtros?.status) {
      conditions.push(eq(contas.status, filtros.status))
    }
    if (filtros?.dataInicio && filtros?.dataFim) {
      conditions.push(between(contas.dataVencimento, filtros.dataInicio, filtros.dataFim))
    }

    const rows = await db
      .select()
      .from(contas)
      .where(and(...conditions))
      .orderBy(contas.dataVencimento)

    return rows.map(toConta)
  }

  async pagar(tenantId: string, id: string): Promise<Conta | null> {
    const [row] = await db
      .update(contas)
      .set({ status: 'PAGA', dataPagamento: new Date(), updatedAt: new Date() })
      .where(and(eq(contas.tenantId, tenantId), eq(contas.id, id)))
      .returning()

    return row ? toConta(row) : null
  }

  async cancelar(tenantId: string, id: string): Promise<Conta | null> {
    const [row] = await db
      .update(contas)
      .set({ status: 'CANCELADA', updatedAt: new Date() })
      .where(and(eq(contas.tenantId, tenantId), eq(contas.id, id)))
      .returning()

    return row ? toConta(row) : null
  }
}
