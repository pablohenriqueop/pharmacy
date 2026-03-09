import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { CadastrarCategoriaUseCase } from '@/application/use-cases/categoria/CadastrarCategoriaUseCase.ts'
import { ListarCategoriasUseCase } from '@/application/use-cases/categoria/ListarCategoriasUseCase.ts'
import { AtualizarCategoriaUseCase } from '@/application/use-cases/categoria/AtualizarCategoriaUseCase.ts'
import { DrizzleCategoriaRepository } from '@/infrastructure/repositories/DrizzleCategoriaRepository.ts'
import { requirePermission } from '@/presentation/middleware/authMiddleware.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'

const repo = new DrizzleCategoriaRepository()
const cadastrar = new CadastrarCategoriaUseCase(repo)
const listar = new ListarCategoriasUseCase(repo)
const atualizar = new AtualizarCategoriaUseCase(repo)

const criarCategoriaSchema = z.object({
  nome: z.string().min(1).max(100),
})

const atualizarCategoriaSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  ativo: z.boolean().optional(),
})

const listarFiltrosSchema = z.object({
  ativo: z.coerce.boolean().optional(),
})

export async function categoriaRoutes(app: FastifyInstance) {
  // Criar categoria — mesmo nível de produto (boss, admin, gerente)
  app.post('/categorias', { preHandler: [requirePermission({ produto: ['create'] })] }, async (request, reply) => {
    const body = criarCategoriaSchema.parse(request.body)
    const categoria = await cadastrar.execute({ ...body, tenantId: request.tenantId })

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CATEGORIA_CRIADA',
      entidade: 'categoria',
      entidadeId: categoria.id,
      detalhes: { nome: categoria.nome },
      ip: request.ip,
    })

    return reply.status(201).send(categoria.props)
  })

  // Listar categorias — qualquer usuário autenticado pode ler
  app.get('/categorias', { preHandler: [requirePermission({ produto: ['read'] })] }, async (request, reply) => {
    const filtros = listarFiltrosSchema.parse(request.query)
    const categorias = await listar.execute(request.tenantId, filtros)
    return reply.send(categorias.map(c => c.props))
  })

  // Atualizar categoria
  app.put('/categorias/:id', { preHandler: [requirePermission({ produto: ['update'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = atualizarCategoriaSchema.parse(request.body)
    const categoria = await atualizar.execute(request.tenantId, id, body)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CATEGORIA_ATUALIZADA',
      entidade: 'categoria',
      entidadeId: id,
      detalhes: body,
      ip: request.ip,
    })

    return reply.send(categoria.props)
  })

  // Desativar categoria (soft delete via update ativo=false)
  app.delete('/categorias/:id', { preHandler: [requirePermission({ produto: ['delete'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await atualizar.execute(request.tenantId, id, { ativo: false })

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'CATEGORIA_DESATIVADA',
      entidade: 'categoria',
      entidadeId: id,
      ip: request.ip,
    })

    return reply.status(204).send()
  })
}
