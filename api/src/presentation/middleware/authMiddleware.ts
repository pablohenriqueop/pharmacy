import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '@/infrastructure/auth/auth.ts'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user: SessionUser
    tenantId: string
  }
}

export async function authMiddleware(app: FastifyInstance) {
  app.decorateRequest('user', null)
  app.decorateRequest('tenantId', null)

  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Rotas de auth não precisam de sessão
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
      role: (u.role as string) ?? 'operador',
      tenantId: u.tenantId as string,
    }

    request.tenantId = request.user.tenantId
  })
}
