import { eq, and } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { caixas } from '@/infrastructure/db/schema.ts'
import { Caixa } from '@/domain/entities/Caixa.ts'
import type { AbrirCaixaInput, CaixaStatus } from '@/domain/entities/Caixa.ts'
import type { ICaixaRepository } from '@/application/repositories/ICaixaRepository.ts'

function toCaixa(row: typeof caixas.$inferSelect): Caixa {
  return new Caixa({
    id: row.id,
    tenantId: row.tenantId,
    valorAbertura: Number(row.valorAbertura),
    valorFechamento: row.valorFechamento ? Number(row.valorFechamento) : null,
    aberturaEm: row.aberturaEm,
    fechamentoEm: row.fechamentoEm,
    status: row.status as CaixaStatus,
  })
}

export class DrizzleCaixaRepository implements ICaixaRepository {
  async abrir(input: AbrirCaixaInput): Promise<Caixa> {
    const [row] = await db.insert(caixas).values({
      tenantId: input.tenantId,
      valorAbertura: String(input.valorAbertura),
      status: 'ABERTO',
    }).returning()

    return toCaixa(row!)
  }

  async buscarPorId(tenantId: string, id: string): Promise<Caixa | null> {
    const [row] = await db
      .select()
      .from(caixas)
      .where(and(eq(caixas.tenantId, tenantId), eq(caixas.id, id)))

    return row ? toCaixa(row) : null
  }

  async buscarAberto(tenantId: string): Promise<Caixa | null> {
    const [row] = await db
      .select()
      .from(caixas)
      .where(and(eq(caixas.tenantId, tenantId), eq(caixas.status, 'ABERTO')))

    return row ? toCaixa(row) : null
  }

  async fechar(tenantId: string, id: string, valorFechamento: number): Promise<Caixa | null> {
    const [row] = await db
      .update(caixas)
      .set({
        valorFechamento: String(valorFechamento),
        fechamentoEm: new Date(),
        status: 'FECHADO',
      })
      .where(and(eq(caixas.tenantId, tenantId), eq(caixas.id, id)))
      .returning()

    return row ? toCaixa(row) : null
  }
}
