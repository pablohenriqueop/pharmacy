import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '@/infrastructure/auth/auth.ts'
import { roles, type Role } from '@/infrastructure/auth/permissions.ts'
import { verificarPin, temPinDefinido } from '@/infrastructure/auth/pin.ts'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  tenantId: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user: SessionUser
    tenantId: string
  }
}

/**
 * Middleware unificado de autenticação + autorização (RBAC).
 * Registrado com fastify-plugin para propagar globalmente.
 */
export const authMiddleware = fp(async (app: FastifyInstance) => {
  app.decorateRequest('user', null as unknown as SessionUser)
  app.decorateRequest('tenantId', null as unknown as string)

  // --- Autenticação (onRequest) ---
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.url.startsWith('/api/auth/')) return

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })

    if (!session) {
      return reply.status(401).send({ error: 'Não autenticado' })
    }

    const u = session.user as Record<string, unknown>

    request.user = {
      id: u.id as string,
      name: u.name as string,
      email: u.email as string,
      role: ((u.role as string) ?? 'operador') as Role,
      tenantId: u.tenantId as string,
    }

    request.tenantId = request.user.tenantId
  })
})

// --- Autorização (preHandler por rota) ---
export function requirePermission(permission: Record<string, string[]>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user?.role

    if (!userRole || !(userRole in roles)) {
      return reply.status(403).send({ error: 'Perfil desconhecido' })
    }

    const role = roles[userRole]
    const check = (role.authorize as (p: Record<string, string[]>) => { success: boolean })(permission)

    if (!check.success) {
      return reply.status(403).send({ error: 'Sem permissão para esta ação' })
    }
  }
}

// --- PIN de confirmação (preHandler por rota sensível) ---
export function requirePin() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.id
    if (!userId) {
      return reply.status(401).send({ error: 'Não autenticado' })
    }

    const temPin = await temPinDefinido(userId)
    if (!temPin) {
      return reply.status(403).send({ error: 'PIN não definido. Defina seu PIN antes de realizar esta ação.', code: 'PIN_NOT_SET' })
    }

    const pin = request.headers['x-pin'] as string | undefined
    if (!pin) {
      return reply.status(403).send({ error: 'PIN de confirmação obrigatório para esta ação.', code: 'PIN_REQUIRED' })
    }

    const valido = await verificarPin(userId, pin)
    if (!valido) {
      return reply.status(403).send({ error: 'PIN incorreto.', code: 'PIN_INVALID' })
    }
  }
}
