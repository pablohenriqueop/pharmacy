import { eq, and } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { nfce } from '@/infrastructure/db/schema.ts'
import { Nfce } from '@/domain/entities/Nfce.ts'
import type { NfceStatus } from '@/domain/entities/Nfce.ts'
import type { INfceRepository, CriarNfceInput } from '@/application/repositories/INfceRepository.ts'

function toNfce(row: typeof nfce.$inferSelect): Nfce {
  return new Nfce({
    id: row.id,
    tenantId: row.tenantId,
    vendaId: row.vendaId,
    chave: row.chave,
    numero: row.numero,
    serie: row.serie,
    xml: row.xml,
    protocolo: row.protocolo,
    status: row.status as NfceStatus,
    motivoCancelamento: row.motivoCancelamento,
    createdAt: row.createdAt,
  })
}

export class DrizzleNfceRepository implements INfceRepository {
  async criar(input: CriarNfceInput): Promise<Nfce> {
    const [row] = await db.insert(nfce).values({
      tenantId: input.tenantId,
      vendaId: input.vendaId,
      chave: input.chave,
      numero: input.numero,
      serie: input.serie,
      xml: input.xml,
      protocolo: input.protocolo,
      status: input.status,
    }).returning()

    return toNfce(row!)
  }

  async buscarPorId(tenantId: string, id: string): Promise<Nfce | null> {
    const [row] = await db
      .select()
      .from(nfce)
      .where(and(eq(nfce.tenantId, tenantId), eq(nfce.id, id)))

    return row ? toNfce(row) : null
  }

  async buscarPorVendaId(tenantId: string, vendaId: string): Promise<Nfce | null> {
    const [row] = await db
      .select()
      .from(nfce)
      .where(and(eq(nfce.tenantId, tenantId), eq(nfce.vendaId, vendaId)))

    return row ? toNfce(row) : null
  }

  async cancelar(tenantId: string, id: string, motivoCancelamento: string): Promise<Nfce | null> {
    const [row] = await db
      .update(nfce)
      .set({ status: 'CANCELADA', motivoCancelamento })
      .where(and(eq(nfce.tenantId, tenantId), eq(nfce.id, id)))
      .returning()

    return row ? toNfce(row) : null
  }
}
