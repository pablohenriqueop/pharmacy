import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { CriarContaUseCase } from '@/application/use-cases/financeiro/CriarContaUseCase.ts'
import { ListarContasUseCase } from '@/application/use-cases/financeiro/ListarContasUseCase.ts'
import { PagarContaUseCase } from '@/application/use-cases/financeiro/PagarContaUseCase.ts'
import { CancelarContaUseCase } from '@/application/use-cases/financeiro/CancelarContaUseCase.ts'
import { FluxoCaixaUseCase } from '@/application/use-cases/financeiro/FluxoCaixaUseCase.ts'
import { DrizzleContaRepository } from '@/infrastructure/repositories/DrizzleContaRepository.ts'
import { DrizzleFluxoCaixaRepository } from '@/infrastructure/repositories/DrizzleFluxoCaixaRepository.ts'
import { requirePermission } from '@/presentation/middleware/authMiddleware.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'
import { paginacaoSchema } from '@/presentation/schemas/paginacao.ts'

const contaRepo = new DrizzleContaRepository()
const fluxoRepo = new DrizzleFluxoCaixaRepository()

const criarConta = new CriarContaUseCase(contaRepo)
const listarContas = new ListarContasUseCase(contaRepo)
const pagarConta = new PagarContaUseCase(contaRepo)
const cancelarConta = new CancelarContaUseCase(contaRepo)
const fluxoCaixa = new FluxoCaixaUseCase(fluxoRepo)

const criarContaSchema = z.object({
  tipo: z.enum(['PAGAR', 'RECEBER']),
  descricao: z.string().min(1).max(255),
  valor: z.number().positive(),
  categoria: z.string().max(100).optional(),
  dataVencimento: z.coerce.date(),
})

const listarFiltrosSchema = z.object({
  tipo: z.enum(['PAGAR', 'RECEBER']).optional(),
  status: z.enum(['PENDENTE', 'PAGA', 'CANCELADA']).optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
}).merge(paginacaoSchema)

const filtroSchema = z.object({
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
})

export async function financeiroRoutes(app: FastifyInstance) {
  app.post('/financeiro/contas', { preHandler: [requirePermission({ financeiro: ['read'] })] }, async (request, reply) => {
    const body = criarContaSchema.parse(request.body)
    const conta = await criarConta.execute({ ...body, tenantId: request.tenantId })

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CONTA_CRIADA',
      entidade: 'conta',
      entidadeId: conta.id,
      detalhes: { tipo: conta.tipo, descricao: conta.descricao, valor: conta.valor },
      ip: request.ip,
    })

    return reply.status(201).send(conta.props)
  })

  app.get('/financeiro/contas', { preHandler: [requirePermission({ financeiro: ['read'] })] }, async (request, reply) => {
    const { pagina, porPagina, ...filtros } = listarFiltrosSchema.parse(request.query)
    const resultado = await listarContas.execute(request.tenantId, filtros, { pagina, porPagina })
    return reply.send({ ...resultado, dados: resultado.dados.map(c => c.props) })
  })

  app.post('/financeiro/contas/:id/pagar', { preHandler: [requirePermission({ financeiro: ['read'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const conta = await pagarConta.execute(request.tenantId, id)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CONTA_PAGA',
      entidade: 'conta',
      entidadeId: id,
      detalhes: { tipo: conta.tipo, valor: conta.valor },
      ip: request.ip,
    })

    return reply.send(conta.props)
  })

  app.post('/financeiro/contas/:id/cancelar', { preHandler: [requirePermission({ financeiro: ['read'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const conta = await cancelarConta.execute(request.tenantId, id)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CONTA_CANCELADA',
      entidade: 'conta',
      entidadeId: id,
      detalhes: { tipo: conta.tipo, valor: conta.valor },
      ip: request.ip,
    })

    return reply.send(conta.props)
  })

  app.get('/financeiro/fluxo-caixa', { preHandler: [requirePermission({ financeiro: ['read'] })] }, async (request, reply) => {
    const filtro = filtroSchema.parse(request.query)
    const resultado = await fluxoCaixa.execute(request.tenantId, filtro)
    return reply.send(resultado)
  })
}
