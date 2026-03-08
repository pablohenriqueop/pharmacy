import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { BuscarConfiguracaoUseCase } from '@/application/use-cases/configuracao/BuscarConfiguracaoUseCase.ts'
import { AtualizarConfiguracaoUseCase } from '@/application/use-cases/configuracao/AtualizarConfiguracaoUseCase.ts'
import { DrizzleConfiguracaoRepository } from '@/infrastructure/repositories/DrizzleConfiguracaoRepository.ts'
import { requirePermission } from '@/presentation/middleware/rbacMiddleware.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'

const repo = new DrizzleConfiguracaoRepository()
const buscarConfiguracao = new BuscarConfiguracaoUseCase(repo)
const atualizarConfiguracao = new AtualizarConfiguracaoUseCase(repo)

const corRegex = /^#[0-9a-fA-F]{6}$/

const atualizarSchema = z.object({
  nomeFarmacia: z.string().min(1).max(255),
  corPrimaria: z.string().regex(corRegex, 'Cor deve ser hexadecimal (#RRGGBB)').optional(),
  corSecundaria: z.string().regex(corRegex, 'Cor deve ser hexadecimal (#RRGGBB)').optional(),
  logoUrl: z.string().url().nullable().optional(),
})

export async function configuracaoRoutes(app: FastifyInstance) {
  app.get('/configuracoes', { preHandler: [requirePermission({ configuracao: ['read'] })] }, async (request, reply) => {
    const config = await buscarConfiguracao.execute(request.tenantId)
    return reply.send(config.props)
  })

  app.put('/configuracoes', { preHandler: [requirePermission({ configuracao: ['update'] })] }, async (request, reply) => {
    const body = atualizarSchema.parse(request.body)
    const config = await atualizarConfiguracao.execute({ ...body, tenantId: request.tenantId })

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CONFIGURACAO_ATUALIZADA',
      entidade: 'configuracao',
      entidadeId: config.id,
      detalhes: { nomeFarmacia: config.nomeFarmacia },
      ip: request.ip,
    })

    return reply.send(config.props)
  })
}
