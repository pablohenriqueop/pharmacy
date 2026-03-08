import type { FastifyInstance } from 'fastify'
import { auth } from '@/infrastructure/auth/auth.ts'

export async function authRoutes(app: FastifyInstance) {
  // Rate limit mais restritivo para rotas de auth (brute force protection)
  app.route({
    method: ['GET', 'POST'],
    url: '/auth/*',
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    handler: async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`)

      const headers = new Headers()
      for (const [key, value] of Object.entries(request.headers)) {
        if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value)
      }

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.method !== 'GET' ? JSON.stringify(request.body) : undefined,
      })

      const response = await auth.handler(req)

      reply.status(response.status)
      response.headers.forEach((value, key) => reply.header(key, value))

      const text = await response.text()
      return reply.send(text || null)
    },
  })
}
