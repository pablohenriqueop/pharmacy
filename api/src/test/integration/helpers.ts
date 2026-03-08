import { sql } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { produtos, caixas, vendas, itensVenda, contas, auditLogs, nfce, configuracoes } from '@/infrastructure/db/schema.ts'

export async function limparBanco() {
  await db.delete(auditLogs)
  await db.delete(nfce)
  await db.delete(itensVenda)
  await db.delete(vendas)
  await db.delete(caixas)
  await db.delete(contas)
  await db.delete(produtos)
  await db.delete(configuracoes)
}

export async function seedProduto(overrides: Record<string, unknown> = {}) {
  const defaults = {
    tenantId: '00000000-0000-0000-0000-000000000001',
    nome: 'Dipirona 500mg',
    precoVenda: '8.50',
    unidade: 'UN',
    estoqueAtual: 50,
    estoqueMinimo: 5,
    ativo: true,
  }

  const [row] = await db.insert(produtos).values({ ...defaults, ...overrides }).returning()
  return row!
}

export async function seedCaixa(overrides: Record<string, unknown> = {}) {
  const defaults = {
    tenantId: '00000000-0000-0000-0000-000000000001',
    valorAbertura: '100.00',
    status: 'ABERTO',
  }

  const [row] = await db.insert(caixas).values({ ...defaults, ...overrides }).returning()
  return row!
}
