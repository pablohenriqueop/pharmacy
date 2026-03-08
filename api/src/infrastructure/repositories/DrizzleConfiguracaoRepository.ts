import { eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { configuracoes } from '@/infrastructure/db/schema.ts'
import { Configuracao } from '@/domain/entities/Configuracao.ts'
import type { AtualizarConfiguracaoInput } from '@/domain/entities/Configuracao.ts'
import type { IConfiguracaoRepository } from '@/application/repositories/IConfiguracaoRepository.ts'

function toConfiguracao(row: typeof configuracoes.$inferSelect): Configuracao {
  return new Configuracao({
    id: row.id,
    tenantId: row.tenantId,
    nomeFarmacia: row.nomeFarmacia,
    corPrimaria: row.corPrimaria,
    corSecundaria: row.corSecundaria,
    logoUrl: row.logoUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class DrizzleConfiguracaoRepository implements IConfiguracaoRepository {
  async buscarPorTenantId(tenantId: string): Promise<Configuracao | null> {
    const [row] = await db
      .select()
      .from(configuracoes)
      .where(eq(configuracoes.tenantId, tenantId))

    return row ? toConfiguracao(row) : null
  }

  async criarOuAtualizar(input: AtualizarConfiguracaoInput): Promise<Configuracao> {
    const existing = await this.buscarPorTenantId(input.tenantId)

    if (existing) {
      const [row] = await db
        .update(configuracoes)
        .set({
          nomeFarmacia: input.nomeFarmacia,
          corPrimaria: input.corPrimaria ?? existing.corPrimaria,
          corSecundaria: input.corSecundaria ?? existing.corSecundaria,
          logoUrl: input.logoUrl !== undefined ? input.logoUrl : existing.logoUrl,
          updatedAt: new Date(),
        })
        .where(eq(configuracoes.tenantId, input.tenantId))
        .returning()

      return toConfiguracao(row!)
    }

    const [row] = await db.insert(configuracoes).values({
      tenantId: input.tenantId,
      nomeFarmacia: input.nomeFarmacia,
      corPrimaria: input.corPrimaria ?? '#0095DA',
      corSecundaria: input.corSecundaria ?? '#FFFFFF',
      logoUrl: input.logoUrl ?? null,
    }).returning()

    return toConfiguracao(row!)
  }
}
