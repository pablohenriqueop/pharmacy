import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { definirPin, verificarPin, temPinDefinido } from '@/infrastructure/auth/pin.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'

const pinSchema = z.object({
  pin: z.string().min(6, 'PIN deve ter no mínimo 6 dígitos').regex(/^\d+$/, 'PIN deve conter apenas números'),
})

export async function pinRoutes(app: FastifyInstance) {
  // Verificar se o usuário tem PIN definido
  app.get('/pin/status', async (request) => {
    const temPin = await temPinDefinido(request.user.id)
    return { temPin }
  })

  // Definir ou alterar PIN
  app.post('/pin/definir', async (request, reply) => {
    const { pin } = pinSchema.parse(request.body)

    await definirPin(request.user.id, pin)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'PIN_DEFINIDO',
      entidade: 'user',
      entidadeId: request.user.id,
      detalhes: undefined,
      ip: request.ip,
    })

    return reply.status(200).send({ ok: true })
  })

  // Verificar PIN (usado antes de ações sensíveis)
  app.post('/pin/verificar', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const { pin } = pinSchema.parse(request.body)

    const valido = await verificarPin(request.user.id, pin)

    if (!valido) {
      await auditService.registrar({
        tenantId: request.tenantId,
        userId: request.user.id,
        acao: 'PIN_FALHA',
        entidade: 'user',
        entidadeId: request.user.id,
        detalhes: undefined,
        ip: request.ip,
      })

      return reply.status(403).send({ error: 'PIN incorreto' })
    }

    return { ok: true }
  })
}
