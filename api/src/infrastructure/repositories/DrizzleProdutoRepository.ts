import { eq, and, ilike } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { produtos } from '@/infrastructure/db/schema.ts'
import { Produto } from '@/domain/entities/Produto.ts'
import type { CriarProdutoInput, AtualizarProdutoInput } from '@/domain/entities/Produto.ts'
import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'

function toProduto(row: typeof produtos.$inferSelect): Produto {
  return new Produto({
    id: row.id,
    tenantId: row.tenantId,
    nome: row.nome,
    codigoBarras: row.codigoBarras,
    categoria: row.categoria,
    precoVenda: Number(row.precoVenda),
    precoCusto: row.precoCusto ? Number(row.precoCusto) : null,
    unidade: row.unidade,
    estoqueAtual: row.estoqueAtual,
    estoqueMinimo: row.estoqueMinimo,
    ativo: row.ativo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class DrizzleProdutoRepository implements IProdutoRepository {
  async criar(input: CriarProdutoInput): Promise<Produto> {
    const [row] = await db.insert(produtos).values({
      tenantId: input.tenantId,
      nome: input.nome,
      codigoBarras: input.codigoBarras ?? null,
      categoria: input.categoria ?? null,
      precoVenda: String(input.precoVenda),
      precoCusto: input.precoCusto != null ? String(input.precoCusto) : null,
      unidade: input.unidade ?? 'UN',
      estoqueAtual: input.estoqueAtual ?? 0,
      estoqueMinimo: input.estoqueMinimo ?? 5,
    }).returning()

    return toProduto(row!)
  }

  async buscarPorId(tenantId: string, id: string): Promise<Produto | null> {
    const [row] = await db
      .select()
      .from(produtos)
      .where(and(eq(produtos.tenantId, tenantId), eq(produtos.id, id)))

    return row ? toProduto(row) : null
  }

  async buscarPorCodigoBarras(tenantId: string, codigoBarras: string): Promise<Produto | null> {
    const [row] = await db
      .select()
      .from(produtos)
      .where(and(eq(produtos.tenantId, tenantId), eq(produtos.codigoBarras, codigoBarras)))

    return row ? toProduto(row) : null
  }

  async listar(tenantId: string, filtros?: { nome?: string; categoria?: string; ativo?: boolean }): Promise<Produto[]> {
    const conditions = [eq(produtos.tenantId, tenantId)]

    if (filtros?.nome) {
      conditions.push(ilike(produtos.nome, `%${filtros.nome}%`))
    }
    if (filtros?.categoria) {
      conditions.push(eq(produtos.categoria, filtros.categoria))
    }
    if (filtros?.ativo !== undefined) {
      conditions.push(eq(produtos.ativo, filtros.ativo))
    }

    const rows = await db
      .select()
      .from(produtos)
      .where(and(...conditions))

    return rows.map(toProduto)
  }

  async atualizar(tenantId: string, id: string, input: AtualizarProdutoInput): Promise<Produto | null> {
    const values: Record<string, unknown> = { updatedAt: new Date() }

    if (input.nome !== undefined) values.nome = input.nome
    if (input.codigoBarras !== undefined) values.codigoBarras = input.codigoBarras
    if (input.categoria !== undefined) values.categoria = input.categoria
    if (input.precoVenda !== undefined) values.precoVenda = String(input.precoVenda)
    if (input.precoCusto !== undefined) values.precoCusto = input.precoCusto != null ? String(input.precoCusto) : null
    if (input.unidade !== undefined) values.unidade = input.unidade
    if (input.estoqueAtual !== undefined) values.estoqueAtual = input.estoqueAtual
    if (input.estoqueMinimo !== undefined) values.estoqueMinimo = input.estoqueMinimo
    if (input.ativo !== undefined) values.ativo = input.ativo

    const [row] = await db
      .update(produtos)
      .set(values)
      .where(and(eq(produtos.tenantId, tenantId), eq(produtos.id, id)))
      .returning()

    return row ? toProduto(row) : null
  }

  async desativar(tenantId: string, id: string): Promise<boolean> {
    const [row] = await db
      .update(produtos)
      .set({ ativo: false, updatedAt: new Date() })
      .where(and(eq(produtos.tenantId, tenantId), eq(produtos.id, id)))
      .returning()

    return !!row
  }
}
