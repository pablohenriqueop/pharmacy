import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { RelatorioVendasUseCase } from '@/application/use-cases/relatorio/RelatorioVendasUseCase.ts'
import { ProdutosMaisVendidosUseCase } from '@/application/use-cases/relatorio/ProdutosMaisVendidosUseCase.ts'
import { AlertaEstoqueUseCase } from '@/application/use-cases/relatorio/AlertaEstoqueUseCase.ts'
import { DrizzleRelatorioRepository } from '@/infrastructure/repositories/DrizzleRelatorioRepository.ts'
import { requirePermission } from '@/presentation/middleware/authMiddleware.ts'

const repo = new DrizzleRelatorioRepository()
const relatorioVendas = new RelatorioVendasUseCase(repo)
const produtosMaisVendidos = new ProdutosMaisVendidosUseCase(repo)
const alertaEstoque = new AlertaEstoqueUseCase(repo)

const filtroSchema = z.object({
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
})

const rankingSchema = z.object({
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  limite: z.coerce.number().int().min(1).max(100).optional(),
})

export async function relatorioRoutes(app: FastifyInstance) {
  app.get('/relatorios/vendas', { preHandler: [requirePermission({ relatorio: ['read'] })] }, async (request, reply) => {
    const filtro = filtroSchema.parse(request.query)
    const resultado = await relatorioVendas.execute(request.tenantId, filtro)
    return reply.send(resultado)
  })

  app.get('/relatorios/produtos-mais-vendidos', { preHandler: [requirePermission({ relatorio: ['read'] })] }, async (request, reply) => {
    const { limite, ...filtro } = rankingSchema.parse(request.query)
    const resultado = await produtosMaisVendidos.execute(request.tenantId, filtro, limite)
    return reply.send(resultado)
  })

  app.get('/relatorios/alertas-estoque', { preHandler: [requirePermission({ relatorio: ['read'] })] }, async (request, reply) => {
    const resultado = await alertaEstoque.execute(request.tenantId)
    return reply.send(resultado)
  })
}
