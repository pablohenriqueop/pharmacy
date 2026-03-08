import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { buildTestApp } from './setup.ts'
import { limparBanco, seedCaixa } from './helpers.ts'
import type { FastifyInstance } from 'fastify'

describe('Caixa — Integração', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildTestApp()
  })

  beforeEach(async () => {
    await limparBanco()
  })

  afterAll(async () => {
    await app.close()
  })

  // ==================== POST /api/caixas/abrir ====================

  describe('POST /api/caixas/abrir', () => {
    it('deve abrir caixa — 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/caixas/abrir',
        payload: { valorAbertura: 100 },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.status).toBe('ABERTO')
      expect(Number(body.valorAbertura)).toBe(100)
    })

    it('deve retornar caixa existente se já aberto — 201', async () => {
      const primeiro = await app.inject({
        method: 'POST',
        url: '/api/caixas/abrir',
        payload: { valorAbertura: 100 },
      })

      const segundo = await app.inject({
        method: 'POST',
        url: '/api/caixas/abrir',
        payload: { valorAbertura: 200 },
      })

      expect(primeiro.json().id).toBe(segundo.json().id)
    })

    it('deve rejeitar payload inválido — 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/caixas/abrir',
        payload: { valorAbertura: -50 },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ==================== GET /api/caixas/aberto ====================

  describe('GET /api/caixas/aberto', () => {
    it('deve retornar caixa aberto — 200', async () => {
      await seedCaixa()

      const res = await app.inject({ method: 'GET', url: '/api/caixas/aberto' })

      expect(res.statusCode).toBe(200)
      expect(res.json().status).toBe('ABERTO')
    })

    it('deve retornar 409 quando não há caixa aberto', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/caixas/aberto' })

      expect(res.statusCode).toBe(409)
    })
  })

  // ==================== POST /api/caixas/:id/fechar ====================

  describe('POST /api/caixas/:id/fechar', () => {
    it('deve fechar caixa — 200', async () => {
      const caixa = await seedCaixa()

      const res = await app.inject({
        method: 'POST',
        url: `/api/caixas/${caixa.id}/fechar`,
        payload: { valorFechamento: 850 },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().status).toBe('FECHADO')
    })

    it('deve retornar 404 para caixa inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/caixas/00000000-0000-0000-0000-000000000099/fechar',
        payload: { valorFechamento: 100 },
      })

      expect(res.statusCode).toBe(404)
    })

    it('deve retornar 409 para caixa já fechado', async () => {
      const caixa = await seedCaixa({ status: 'FECHADO', valorFechamento: '500.00', fechamentoEm: new Date() })

      const res = await app.inject({
        method: 'POST',
        url: `/api/caixas/${caixa.id}/fechar`,
        payload: { valorFechamento: 500 },
      })

      expect(res.statusCode).toBe(409)
    })
  })
})
