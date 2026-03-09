/**
 * Seed de desenvolvimento — cria a farmácia Farmatem com dados iniciais.
 *
 * Uso: bun run scripts/seed-dev.ts
 * Requer: API rodando em localhost:3000 (ou BETTER_AUTH_URL)
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import { randomUUIDv7 } from 'bun'
import * as schema from '../src/infrastructure/db/schema.ts'

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://pharmacy:pharmacy_dev@localhost:5432/pharmacy'

const client = postgres(DATABASE_URL)
const db = drizzle(client, { schema })

const TENANT_ID = randomUUIDv7()
const now = new Date()

async function seed() {
  console.log('Iniciando seed de desenvolvimento...\n')

  // 1. Criar usuário boss via BetterAuth sign-up API
  const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

  console.log('Criando usuário boss...')
  const signUpRes = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Pablo Henrique',
      email: 'pablohenriqueop@gmail.com',
      password: '12345678',
      tenantId: TENANT_ID,
    }),
  })

  if (!signUpRes.ok) {
    const err = await signUpRes.text()
    if (err.includes('already') || err.includes('unique')) {
      console.log('  → Usuário já existe, pulando criação.')
    } else {
      throw new Error(`Falha ao criar usuário: ${signUpRes.status} ${err}`)
    }
  } else {
    console.log('  → Usuário criado com sucesso!')

    // Atualizar role para boss (BetterAuth cria com defaultRole 'operador')
    await db
      .update(schema.user)
      .set({ role: 'boss' })
      .where(eq(schema.user.email, 'pablohenriqueop@gmail.com'))
    console.log('  → Role atualizada para boss!')
  }

  // Definir PIN padrão para o boss (123456)
  const bossPin = await Bun.password.hash('123456', { algorithm: 'bcrypt', cost: 12 })
  await db
    .update(schema.user)
    .set({ pinHash: bossPin })
    .where(eq(schema.user.email, 'pablohenriqueop@gmail.com'))
  console.log('  → PIN padrão definido (123456)')

  // Criar usuário operador (Maria)
  console.log('\nCriando usuário operador...')
  const signUpMaria = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maria Silva',
      email: 'maria@farmatem.com',
      password: '12345678',
      tenantId: TENANT_ID,
    }),
  })

  if (!signUpMaria.ok) {
    const err = await signUpMaria.text()
    if (err.includes('already') || err.includes('unique')) {
      console.log('  → Operador já existe, pulando criação.')
    } else {
      throw new Error(`Falha ao criar operador: ${signUpMaria.status} ${err}`)
    }
  } else {
    console.log('  → Operador criado com sucesso!')
  }

  // 2. Criar configuração white-label (Farmatem)
  console.log('\nCriando configuração da farmácia...')
  await db
    .insert(schema.configuracoes)
    .values({
      tenantId: TENANT_ID,
      nomeFarmacia: 'Farmatem',
      corPrimaria: '#0095DA',
      corSecundaria: '#FFFFFF',
    })
    .onConflictDoNothing()
  console.log('  → Farmácia "Farmatem" configurada!')

  // 3. Criar produtos de exemplo
  console.log('\nCriando produtos de exemplo...')
  const produtosExemplo = [
    { nome: 'Dipirona 500mg', codigoBarras: '7891234560010', categoria: 'Analgésico', laboratorio: 'Medley', precoVenda: '8.90', precoCusto: '4.50', estoqueAtual: 150, estoqueMinimo: 20 },
    { nome: 'Paracetamol 750mg', codigoBarras: '7891234560027', categoria: 'Analgésico', laboratorio: 'EMS', precoVenda: '12.50', precoCusto: '6.00', estoqueAtual: 200, estoqueMinimo: 30 },
    { nome: 'Ibuprofeno 400mg', codigoBarras: '7891234560034', categoria: 'Anti-inflamatório', laboratorio: 'Neo Química', precoVenda: '15.90', precoCusto: '8.20', estoqueAtual: 100, estoqueMinimo: 15 },
    { nome: 'Amoxicilina 500mg', codigoBarras: '7891234560041', categoria: 'Antibiótico', laboratorio: 'Eurofarma', precoVenda: '22.00', precoCusto: '11.50', estoqueAtual: 80, estoqueMinimo: 10 },
    { nome: 'Omeprazol 20mg', codigoBarras: '7891234560058', categoria: 'Gastro', laboratorio: 'Aché', precoVenda: '18.90', precoCusto: '9.00', estoqueAtual: 120, estoqueMinimo: 15 },
    { nome: 'Loratadina 10mg', codigoBarras: '7891234560065', categoria: 'Antialérgico', laboratorio: 'Cimed', precoVenda: '14.50', precoCusto: '7.00', estoqueAtual: 90, estoqueMinimo: 10 },
    { nome: 'Vitamina C 1g Efervescente', codigoBarras: '7891234560072', categoria: 'Vitaminas', laboratorio: 'Bayer', precoVenda: '25.90', precoCusto: '13.00', estoqueAtual: 60, estoqueMinimo: 10 },
    { nome: 'Soro Fisiológico 500ml', codigoBarras: '7891234560089', categoria: 'Cuidados', laboratorio: null, precoVenda: '9.90', precoCusto: '4.00', estoqueAtual: 50, estoqueMinimo: 10 },
    { nome: 'Álcool Gel 70% 500ml', codigoBarras: '7891234560096', categoria: 'Higiene', laboratorio: null, precoVenda: '16.90', precoCusto: '8.50', estoqueAtual: 40, estoqueMinimo: 10 },
    { nome: 'Protetor Solar FPS 50', codigoBarras: '7891234560102', categoria: 'Dermatológico', laboratorio: 'La Roche-Posay', precoVenda: '45.90', precoCusto: '22.00', estoqueAtual: 30, estoqueMinimo: 5 },
  ]

  for (const p of produtosExemplo) {
    await db
      .insert(schema.produtos)
      .values({
        tenantId: TENANT_ID,
        ...p,
        unidade: 'UN',
        ativo: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
  }
  console.log(`  → ${produtosExemplo.length} produtos criados!`)

  console.log('\n✓ Seed concluído com sucesso!')
  console.log(`  Tenant ID: ${TENANT_ID}`)
  console.log('  Boss:     pablohenriqueop@gmail.com / 12345678 (PIN: 123456)')
  console.log('  Operador: maria@farmatem.com / 12345678')
  console.log('  Farmácia: Farmatem')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Erro no seed:', err)
  process.exit(1)
})
