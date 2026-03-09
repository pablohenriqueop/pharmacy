import { eq, and, ilike } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { categorias } from '@/infrastructure/db/schema.ts'
import { Categoria } from '@/domain/entities/Categoria.ts'
import type { CriarCategoriaInput, AtualizarCategoriaInput } from '@/domain/entities/Categoria.ts'
import type { ICategoriaRepository } from '@/application/repositories/ICategoriaRepository.ts'

function toCategoria(row: typeof categorias.$inferSelect): Categoria {
  return new Categoria({
    id: row.id,
    tenantId: row.tenantId,
    nome: row.nome,
    ativo: row.ativo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class DrizzleCategoriaRepository implements ICategoriaRepository {
  async criar(input: CriarCategoriaInput): Promise<Categoria> {
    const [row] = await db.insert(categorias).values({
      tenantId: input.tenantId,
      nome: input.nome,
    }).returning()

    return toCategoria(row!)
  }

  async buscarPorId(tenantId: string, id: string): Promise<Categoria | null> {
    const [row] = await db
      .select()
      .from(categorias)
      .where(and(eq(categorias.tenantId, tenantId), eq(categorias.id, id)))

    return row ? toCategoria(row) : null
  }

  async buscarPorNome(tenantId: string, nome: string): Promise<Categoria | null> {
    const [row] = await db
      .select()
      .from(categorias)
      .where(and(eq(categorias.tenantId, tenantId), ilike(categorias.nome, nome)))

    return row ? toCategoria(row) : null
  }

  async listar(tenantId: string, filtros?: { ativo?: boolean }): Promise<Categoria[]> {
    const conditions = [eq(categorias.tenantId, tenantId)]

    if (filtros?.ativo !== undefined) {
      conditions.push(eq(categorias.ativo, filtros.ativo))
    }

    const rows = await db
      .select()
      .from(categorias)
      .where(and(...conditions))
      .orderBy(categorias.nome)

    return rows.map(toCategoria)
  }

  async atualizar(tenantId: string, id: string, input: AtualizarCategoriaInput): Promise<Categoria | null> {
    const values: Record<string, unknown> = { updatedAt: new Date() }

    if (input.nome !== undefined) values.nome = input.nome
    if (input.ativo !== undefined) values.ativo = input.ativo

    const [row] = await db
      .update(categorias)
      .set(values)
      .where(and(eq(categorias.tenantId, tenantId), eq(categorias.id, id)))
      .returning()

    return row ? toCategoria(row) : null
  }
}
