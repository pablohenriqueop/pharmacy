import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { EmitirNfceUseCase } from '@/application/use-cases/nfce/EmitirNfceUseCase.ts'
import { CancelarNfceUseCase } from '@/application/use-cases/nfce/CancelarNfceUseCase.ts'
import { BuscarNfceUseCase } from '@/application/use-cases/nfce/BuscarNfceUseCase.ts'
import { BuscarNfcePorVendaUseCase } from '@/application/use-cases/nfce/BuscarNfcePorVendaUseCase.ts'
import { DrizzleNfceRepository } from '@/infrastructure/repositories/DrizzleNfceRepository.ts'
import { DrizzleVendaRepository } from '@/infrastructure/repositories/DrizzleVendaRepository.ts'
import { StubNfceService } from '@/infrastructure/services/StubNfceService.ts'
import { requirePermission } from '@/presentation/middleware/rbacMiddleware.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'

const nfceRepo = new DrizzleNfceRepository()
const vendaRepo = new DrizzleVendaRepository()
const nfceService = new StubNfceService()

const emitirNfce = new EmitirNfceUseCase(nfceRepo, vendaRepo, nfceService)
const cancelarNfce = new CancelarNfceUseCase(nfceRepo, nfceService)
const buscarNfce = new BuscarNfceUseCase(nfceRepo)
const buscarNfcePorVenda = new BuscarNfcePorVendaUseCase(nfceRepo)

const emitirSchema = z.object({
  vendaId: z.uuid(),
})

const cancelarSchema = z.object({
  motivo: z.string().min(15, 'Motivo deve ter no mínimo 15 caracteres'),
})

export async function nfceRoutes(app: FastifyInstance) {
  app.post('/nfce/emitir', { preHandler: [requirePermission({ nfce: ['emit'] })] }, async (request, reply) => {
    const { vendaId } = emitirSchema.parse(request.body)
    const nfce = await emitirNfce.execute({ tenantId: request.tenantId, vendaId })

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'NFCE_EMITIDA',
      entidade: 'nfce',
      entidadeId: nfce.id,
      detalhes: { vendaId, chave: nfce.chave },
      ip: request.ip,
    })

    return reply.status(201).send(nfce.props)
  })

  app.post('/nfce/:id/cancelar', { preHandler: [requirePermission({ nfce: ['cancel'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { motivo } = cancelarSchema.parse(request.body)
    const nfce = await cancelarNfce.execute({ tenantId: request.tenantId, nfceId: id, motivo })

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'NFCE_CANCELADA',
      entidade: 'nfce',
      entidadeId: id,
      detalhes: { motivo, chave: nfce.chave },
      ip: request.ip,
    })

    return reply.send(nfce.props)
  })

  app.get('/nfce/:id', { preHandler: [requirePermission({ nfce: ['read'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const nfce = await buscarNfce.execute(request.tenantId, id)
    return reply.send(nfce.props)
  })

  app.get('/nfce/venda/:vendaId', { preHandler: [requirePermission({ nfce: ['read'] })] }, async (request, reply) => {
    const { vendaId } = request.params as { vendaId: string }
    const nfce = await buscarNfcePorVenda.execute(request.tenantId, vendaId)
    return reply.send(nfce.props)
  })
}
