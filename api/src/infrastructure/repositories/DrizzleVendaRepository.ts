import { eq, and } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { vendas, itensVenda } from '@/infrastructure/db/schema.ts'
import { Venda } from '@/domain/entities/Venda.ts'
import type { CriarVendaInput, FormaPagamento, VendaStatus, ItemVendaProps } from '@/domain/entities/Venda.ts'
import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'

function toItemProps(row: typeof itensVenda.$inferSelect): ItemVendaProps {
  return {
    id: row.id,
    vendaId: row.vendaId,
    produtoId: row.produtoId,
    quantidade: row.quantidade,
    precoUnit: Number(row.precoUnit),
    subtotal: Number(row.subtotal),
  }
}

function toVenda(row: typeof vendas.$inferSelect, itens: ItemVendaProps[]): Venda {
  return new Venda({
    id: row.id,
    tenantId: row.tenantId,
    caixaId: row.caixaId,
    total: Number(row.total),
    desconto: Number(row.desconto),
    formaPagamento: row.formaPagamento as FormaPagamento,
    valorPago: row.valorPago ? Number(row.valorPago) : null,
    troco: row.troco ? Number(row.troco) : null,
    status: row.status as VendaStatus,
    nfceChave: row.nfceChave,
    createdAt: row.createdAt,
    itens,
  })
}

export class DrizzleVendaRepository implements IVendaRepository {
  async criar(input: CriarVendaInput & { total: number; troco: number | null }): Promise<Venda> {
    const [vendaRow] = await db.insert(vendas).values({
      tenantId: input.tenantId,
      caixaId: input.caixaId,
      total: String(input.total),
      desconto: String(input.desconto ?? 0),
      formaPagamento: input.formaPagamento,
      valorPago: input.valorPago != null ? String(input.valorPago) : null,
      troco: input.troco != null ? String(input.troco) : null,
      status: 'CONCLUIDA',
    }).returning()

    const itensRows = await Promise.all(
      input.itens.map(item => {
        const subtotal = item.precoUnit * item.quantidade
        return db.insert(itensVenda).values({
          vendaId: vendaRow!.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: String(item.precoUnit),
          subtotal: String(subtotal),
        }).returning()
      })
    )

    const itensProps = itensRows.map(([row]) => toItemProps(row!))
    return toVenda(vendaRow!, itensProps)
  }

  async buscarPorId(tenantId: string, id: string): Promise<Venda | null> {
    const [vendaRow] = await db
      .select()
      .from(vendas)
      .where(and(eq(vendas.tenantId, tenantId), eq(vendas.id, id)))

    if (!vendaRow) return null

    const itensRows = await db
      .select()
      .from(itensVenda)
      .where(eq(itensVenda.vendaId, vendaRow.id))

    return toVenda(vendaRow, itensRows.map(toItemProps))
  }

  async listarPorCaixa(tenantId: string, caixaId: string): Promise<Venda[]> {
    const vendaRows = await db
      .select()
      .from(vendas)
      .where(and(eq(vendas.tenantId, tenantId), eq(vendas.caixaId, caixaId)))

    return Promise.all(
      vendaRows.map(async vendaRow => {
        const itensRows = await db
          .select()
          .from(itensVenda)
          .where(eq(itensVenda.vendaId, vendaRow.id))

        return toVenda(vendaRow, itensRows.map(toItemProps))
      })
    )
  }

  async cancelar(tenantId: string, id: string): Promise<Venda | null> {
    const [vendaRow] = await db
      .update(vendas)
      .set({ status: 'CANCELADA' })
      .where(and(eq(vendas.tenantId, tenantId), eq(vendas.id, id)))
      .returning()

    if (!vendaRow) return null

    const itensRows = await db
      .select()
      .from(itensVenda)
      .where(eq(itensVenda.vendaId, vendaRow.id))

    return toVenda(vendaRow, itensRows.map(toItemProps))
  }

  async atualizarNfceChave(tenantId: string, id: string, nfceChave: string): Promise<void> {
    await db
      .update(vendas)
      .set({ nfceChave })
      .where(and(eq(vendas.tenantId, tenantId), eq(vendas.id, id)))
  }
}
