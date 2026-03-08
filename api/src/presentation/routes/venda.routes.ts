import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { CriarVendaUseCase } from '@/application/use-cases/venda/CriarVendaUseCase.ts'
import { BuscarVendaUseCase } from '@/application/use-cases/venda/BuscarVendaUseCase.ts'
import { CancelarVendaUseCase } from '@/application/use-cases/venda/CancelarVendaUseCase.ts'
import { ListarVendasUseCase } from '@/application/use-cases/venda/ListarVendasUseCase.ts'
import { DrizzleVendaRepository } from '@/infrastructure/repositories/DrizzleVendaRepository.ts'
import { DrizzleProdutoRepository } from '@/infrastructure/repositories/DrizzleProdutoRepository.ts'
import { DrizzleCaixaRepository } from '@/infrastructure/repositories/DrizzleCaixaRepository.ts'
import { requirePermission } from '@/presentation/middleware/rbacMiddleware.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'

const vendaRepo = new DrizzleVendaRepository()
const produtoRepo = new DrizzleProdutoRepository()
const caixaRepo = new DrizzleCaixaRepository()

const criarVenda = new CriarVendaUseCase(vendaRepo, produtoRepo, caixaRepo)
const buscarVenda = new BuscarVendaUseCase(vendaRepo)
const cancelarVenda = new CancelarVendaUseCase(vendaRepo, produtoRepo)
const listarVendas = new ListarVendasUseCase(vendaRepo)

const formasPagamento = ['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX'] as const

const criarVendaSchema = z.object({
  caixaId: z.uuid(),
  formaPagamento: z.enum(formasPagamento),
  desconto: z.number().min(0).optional(),
  valorPago: z.number().min(0).optional(),
  itens: z.array(z.object({
    produtoId: z.uuid(),
    quantidade: z.number().int().positive(),
    precoUnit: z.number().positive(),
  })).min(1),
})

export async function vendaRoutes(app: FastifyInstance) {
  app.post('/vendas', { preHandler: [requirePermission({ venda: ['create'] })] }, async (request, reply) => {
    const body = criarVendaSchema.parse(request.body)
    const venda = await criarVenda.execute({ ...body, tenantId: request.tenantId })

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'VENDA_CRIADA',
      entidade: 'venda',
      entidadeId: venda.id,
      detalhes: { total: venda.total, formaPagamento: venda.formaPagamento, itensQtd: venda.itens.length },
      ip: request.ip,
    })

    return reply.status(201).send(venda.props)
  })

  app.get('/vendas/caixa/:caixaId', { preHandler: [requirePermission({ venda: ['read'] })] }, async (request, reply) => {
    const { caixaId } = request.params as { caixaId: string }
    const vendas = await listarVendas.execute(request.tenantId, caixaId)
    return reply.send(vendas.map(v => v.props))
  })

  app.get('/vendas/:id', { preHandler: [requirePermission({ venda: ['read'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const venda = await buscarVenda.execute(request.tenantId, id)
    return reply.send(venda.props)
  })

  app.post('/vendas/:id/cancelar', { preHandler: [requirePermission({ venda: ['cancel'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const venda = await cancelarVenda.execute(request.tenantId, id)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'VENDA_CANCELADA',
      entidade: 'venda',
      entidadeId: id,
      detalhes: { total: venda.total },
      ip: request.ip,
    })

    return reply.send(venda.props)
  })
}
