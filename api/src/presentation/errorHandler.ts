import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/DomainError.ts'

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof DomainError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    })
  }

  // Zod validation errors
  if (error.name === 'ZodError') {
    return reply.status(400).send({
      error: 'Dados inválidos',
      details: JSON.parse(error.message),
    })
  }

  // Nunca expor stack traces em produção
  const isProd = process.env.NODE_ENV === 'production'

  reply.status(500).send({
    error: 'Erro interno',
    message: isProd ? 'Erro interno do servidor' : error.message,
  })
}
