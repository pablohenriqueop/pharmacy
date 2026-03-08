import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { produtoRoutes } from '@/presentation/routes/produto.routes.ts'
import { caixaRoutes } from '@/presentation/routes/caixa.routes.ts'
import { vendaRoutes } from '@/presentation/routes/venda.routes.ts'
import { relatorioRoutes } from '@/presentation/routes/relatorio.routes.ts'
import { financeiroRoutes } from '@/presentation/routes/financeiro.routes.ts'
import { nfceRoutes } from '@/presentation/routes/nfce.routes.ts'
import { configuracaoRoutes } from '@/presentation/routes/configuracao.routes.ts'
import { errorHandler } from '@/presentation/errorHandler.ts'
import type { SessionUser } from '@/presentation/middleware/authMiddleware.ts'

// Augment FastifyRequest para testes
declare module 'fastify' {
  interface FastifyRequest {
    user: SessionUser
    tenantId: string
  }
}

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const defaultUser: SessionUser = {
  id: 'user-admin-001',
  name: 'Admin Teste',
  email: 'admin@farmacia.test',
  role: 'admin',
  tenantId: TENANT_ID,
}

export interface TestAppOptions {
  user?: Partial<SessionUser>
}

export async function buildTestApp(options: TestAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  app.setErrorHandler(errorHandler)

  const user: SessionUser = { ...defaultUser, ...options.user }

  // Middleware fake de auth — injeta user e tenantId sem BetterAuth
  app.decorateRequest('user', null)
  app.decorateRequest('tenantId', null)

  app.addHook('onRequest', async (request) => {
    request.user = user
    request.tenantId = user.tenantId
  })

  await app.register(produtoRoutes, { prefix: '/api' })
  await app.register(caixaRoutes, { prefix: '/api' })
  await app.register(vendaRoutes, { prefix: '/api' })
  await app.register(relatorioRoutes, { prefix: '/api' })
  await app.register(financeiroRoutes, { prefix: '/api' })
  await app.register(nfceRoutes, { prefix: '/api' })
  await app.register(configuracaoRoutes, { prefix: '/api' })

  await app.ready()
  return app
}

export { TENANT_ID, defaultUser }
