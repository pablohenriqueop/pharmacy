import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { authRoutes } from '@/presentation/routes/auth.routes.ts'
import { produtoRoutes } from '@/presentation/routes/produto.routes.ts'
import { caixaRoutes } from '@/presentation/routes/caixa.routes.ts'
import { vendaRoutes } from '@/presentation/routes/venda.routes.ts'
import { relatorioRoutes } from '@/presentation/routes/relatorio.routes.ts'
import { financeiroRoutes } from '@/presentation/routes/financeiro.routes.ts'
import { nfceRoutes } from '@/presentation/routes/nfce.routes.ts'
import { categoriaRoutes } from '@/presentation/routes/categoria.routes.ts'
import { configuracaoRoutes } from '@/presentation/routes/configuracao.routes.ts'
import { pinRoutes } from '@/presentation/routes/pin.routes.ts'
import { errorHandler } from '@/presentation/errorHandler.ts'
import { authMiddleware } from '@/presentation/middleware/authMiddleware.ts'

export async function buildApp() {
  const server = Fastify({
    logger: false,
  })

  server.setErrorHandler(errorHandler)

  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
  })

  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') ?? []

  await server.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })

  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  await server.register(authMiddleware)

  await server.register(authRoutes, { prefix: '/api' })
  await server.register(categoriaRoutes, { prefix: '/api' })
  await server.register(produtoRoutes, { prefix: '/api' })
  await server.register(caixaRoutes, { prefix: '/api' })
  await server.register(vendaRoutes, { prefix: '/api' })
  await server.register(relatorioRoutes, { prefix: '/api' })
  await server.register(financeiroRoutes, { prefix: '/api' })
  await server.register(nfceRoutes, { prefix: '/api' })
  await server.register(configuracaoRoutes, { prefix: '/api' })
  await server.register(pinRoutes, { prefix: '/api' })

  return server
}
