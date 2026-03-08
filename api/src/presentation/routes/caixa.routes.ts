import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { AbrirCaixaUseCase } from '@/application/use-cases/caixa/AbrirCaixaUseCase.ts'
import { FecharCaixaUseCase } from '@/application/use-cases/caixa/FecharCaixaUseCase.ts'
import { BuscarCaixaAbertoUseCase } from '@/application/use-cases/caixa/BuscarCaixaAbertoUseCase.ts'
import { DrizzleCaixaRepository } from '@/infrastructure/repositories/DrizzleCaixaRepository.ts'
import { requirePermission } from '@/presentation/middleware/rbacMiddleware.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'

const repo = new DrizzleCaixaRepository()
const abrir = new AbrirCaixaUseCase(repo)
const fechar = new FecharCaixaUseCase(repo)
const buscarAberto = new BuscarCaixaAbertoUseCase(repo)

const abrirCaixaSchema = z.object({
  valorAbertura: z.number().min(0),
})

const fecharCaixaSchema = z.object({
  valorFechamento: z.number().min(0),
})

export async function caixaRoutes(app: FastifyInstance) {
  app.post('/caixas/abrir', { preHandler: [requirePermission({ caixa: ['open'] })] }, async (request, reply) => {
    const body = abrirCaixaSchema.parse(request.body)
    const caixa = await abrir.execute(request.tenantId, body.valorAbertura)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CAIXA_ABERTO',
      entidade: 'caixa',
      entidadeId: caixa.id,
      detalhes: { valorAbertura: caixa.valorAbertura },
      ip: request.ip,
    })

    return reply.status(201).send(caixa.props)
  })

  app.get('/caixas/aberto', { preHandler: [requirePermission({ caixa: ['read'] })] }, async (request, reply) => {
    const caixa = await buscarAberto.execute(request.tenantId)
    return reply.send(caixa.props)
  })

  app.post('/caixas/:id/fechar', { preHandler: [requirePermission({ caixa: ['close'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = fecharCaixaSchema.parse(request.body)
    const caixa = await fechar.execute(request.tenantId, id, body.valorFechamento)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CAIXA_FECHADO',
      entidade: 'caixa',
      entidadeId: id,
      detalhes: { valorFechamento: caixa.valorFechamento },
      ip: request.ip,
    })

    return reply.send(caixa.props)
  })
}
