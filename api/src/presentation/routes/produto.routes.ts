import type { FastifyInstance } from 'fastify'
import { z } from 'zod/v4'
import { CadastrarProdutoUseCase } from '@/application/use-cases/produto/CadastrarProdutoUseCase.ts'
import { BuscarProdutoUseCase } from '@/application/use-cases/produto/BuscarProdutoUseCase.ts'
import { ListarProdutosUseCase } from '@/application/use-cases/produto/ListarProdutosUseCase.ts'
import { AtualizarProdutoUseCase } from '@/application/use-cases/produto/AtualizarProdutoUseCase.ts'
import { DrizzleProdutoRepository } from '@/infrastructure/repositories/DrizzleProdutoRepository.ts'
import { requirePermission, requirePin } from '@/presentation/middleware/authMiddleware.ts'
import { auditService } from '@/infrastructure/services/AuditService.ts'
import { produtoCache } from '@/infrastructure/cache/ProdutoCache.ts'
import { paginacaoSchema } from '@/presentation/schemas/paginacao.ts'

const repo = new DrizzleProdutoRepository()
const cadastrar = new CadastrarProdutoUseCase(repo)
const buscar = new BuscarProdutoUseCase(repo)
const listar = new ListarProdutosUseCase(repo)
const atualizar = new AtualizarProdutoUseCase(repo)

const criarProdutoSchema = z.object({
  nome: z.string().min(1).max(255),
  codigoBarras: z.string().max(50).optional(),
  categoria: z.string().max(100).optional(),
  precoVenda: z.number().positive(),
  precoCusto: z.number().positive().optional(),
  unidade: z.string().max(10).optional(),
  estoqueAtual: z.number().int().min(0).optional(),
  estoqueMinimo: z.number().int().min(0).optional(),
})

const atualizarProdutoSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  codigoBarras: z.string().max(50).nullable().optional(),
  categoria: z.string().max(100).nullable().optional(),
  precoVenda: z.number().positive().optional(),
  precoCusto: z.number().positive().nullable().optional(),
  unidade: z.string().max(10).optional(),
  estoqueAtual: z.number().int().min(0).optional(),
  estoqueMinimo: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
})

const listarFiltrosSchema = z.object({
  nome: z.string().optional(),
  categoria: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
}).merge(paginacaoSchema)

export async function produtoRoutes(app: FastifyInstance) {
  app.post('/produtos', { preHandler: [requirePermission({ produto: ['create'] })] }, async (request, reply) => {
    const body = criarProdutoSchema.parse(request.body)
    const produto = await cadastrar.execute({ ...body, tenantId: request.tenantId })

    produtoCache.invalidar(request.tenantId)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'PRODUTO_CRIADO',
      entidade: 'produto',
      entidadeId: produto.id,
      detalhes: { nome: produto.nome },
      ip: request.ip,
    })

    return reply.status(201).send(produto.props)
  })

  // Catálogo completo (cache em memória) — usado pelo PDV para busca instantânea
  app.get('/produtos/catalogo', { preHandler: [requirePermission({ produto: ['read'] })] }, async (request, reply) => {
    const produtos = await produtoCache.getCatalogo(request.tenantId, repo)

    const resultado = produtos.map(p => {
      const props = { ...p.props }
      if (request.user.role === 'operador') {
        props.precoCusto = null
      }
      return props
    })

    reply.header('Cache-Control', 'private, max-age=60')
    return reply.send(resultado)
  })

  app.get('/produtos', { preHandler: [requirePermission({ produto: ['read'] })] }, async (request, reply) => {
    const { pagina, porPagina, ...filtros } = listarFiltrosSchema.parse(request.query)
    const resultado = await listar.execute(request.tenantId, filtros, { pagina, porPagina })

    // Operador não vê preço de custo
    const dados = resultado.dados.map(p => {
      const props = { ...p.props }
      if (request.user.role === 'operador') {
        props.precoCusto = null
      }
      return props
    })

    return reply.send({ ...resultado, dados })
  })

  app.get('/produtos/:id', { preHandler: [requirePermission({ produto: ['read'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const produto = await buscar.porId(request.tenantId, id)

    const props = { ...produto.props }
    if (request.user.role === 'operador') {
      props.precoCusto = null
    }

    return reply.send(props)
  })

  app.get('/produtos/codigo-barras/:codigo', { preHandler: [requirePermission({ produto: ['read'] })] }, async (request, reply) => {
    const { codigo } = request.params as { codigo: string }
    const produto = await buscar.porCodigoBarras(request.tenantId, codigo)

    const props = { ...produto.props }
    if (request.user.role === 'operador') {
      props.precoCusto = null
    }

    return reply.send(props)
  })

  app.put('/produtos/:id', { preHandler: [requirePermission({ produto: ['update'] })] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = atualizarProdutoSchema.parse(request.body)
    const produto = await atualizar.execute(request.tenantId, id, body)

    produtoCache.invalidar(request.tenantId)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'PRODUTO_ATUALIZADO',
      entidade: 'produto',
      entidadeId: id,
      detalhes: body,
      ip: request.ip,
    })

    return reply.send(produto.props)
  })

  app.delete('/produtos/:id', { preHandler: [requirePermission({ produto: ['delete'] }), requirePin()] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await atualizar.execute(request.tenantId, id, { ativo: false })

    produtoCache.invalidar(request.tenantId)

    await auditService.registrar({
      tenantId: request.tenantId,
      userId: request.user.id,
      acao: 'PRODUTO_DESATIVADO',
      entidade: 'produto',
      entidadeId: id,
      ip: request.ip,
    })

    return reply.status(204).send()
  })
}
