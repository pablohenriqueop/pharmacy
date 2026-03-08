import type { FastifyRequest, FastifyReply } from 'fastify'
import { roles } from '@/infrastructure/auth/permissions.ts'
import type { Role } from '@/infrastructure/auth/permissions.ts'

export function requirePermission(permission: Record<string, string[]>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user?.role as Role | undefined

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
