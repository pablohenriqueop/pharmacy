import { eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db/connection.ts'
import { user } from '@/infrastructure/db/schema.ts'

const PIN_MIN_LENGTH = 6
const BCRYPT_ROUNDS = 12

/**
 * Valida que o PIN tem pelo menos 6 dígitos numéricos.
 */
export function validarPin(pin: string): boolean {
  return /^\d+$/.test(pin) && pin.length >= PIN_MIN_LENGTH
}

/**
 * Define o PIN de um usuário (hash com bcrypt).
 */
export async function definirPin(userId: string, pin: string): Promise<void> {
  if (!validarPin(pin)) {
    throw new Error(`PIN deve ter no mínimo ${PIN_MIN_LENGTH} dígitos numéricos`)
  }

  const hash = await Bun.password.hash(pin, { algorithm: 'bcrypt', cost: BCRYPT_ROUNDS })

  await db
    .update(user)
    .set({ pinHash: hash, updatedAt: new Date() })
    .where(eq(user.id, userId))
}

/**
 * Verifica se o PIN informado está correto.
 * Retorna false se o usuário não tem PIN definido.
 */
export async function verificarPin(userId: string, pin: string): Promise<boolean> {
  const [row] = await db
    .select({ pinHash: user.pinHash })
    .from(user)
    .where(eq(user.id, userId))

  if (!row?.pinHash) return false

  return Bun.password.verify(pin, row.pinHash)
}

/**
 * Verifica se o usuário já tem PIN definido.
 */
export async function temPinDefinido(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ pinHash: user.pinHash })
    .from(user)
    .where(eq(user.id, userId))

  return !!row?.pinHash
}
