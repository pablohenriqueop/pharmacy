import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { buildTestApp } from './setup.ts'
import { limparBanco } from './helpers.ts'
import type { FastifyInstance } from 'fastify'

describe('Configuração — Integração', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildTestApp({ user: { role: 'boss' } })
  })

  beforeEach(async () => {
    await limparBanco()
  })

  afterAll(async () => {
    await app.close()
  })

  // ==================== PUT /api/configuracoes ====================

  describe('PUT /api/configuracoes', () => {
    it('deve criar configuração — 200', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/configuracoes',
        payload: {
          nomeFarmacia: 'Farmácia Saúde',
          corPrimaria: '#0095DA',
          corSecundaria: '#FFFFFF',
        },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.nomeFarmacia).toBe('Farmácia Saúde')
      expect(body.corPrimaria).toBe('#0095DA')
    })

    it('deve atualizar configuração existente — 200', async () => {
      await app.inject({
        method: 'PUT',
        url: '/api/configuracoes',
        payload: { nomeFarmacia: 'Farmácia Saúde' },
      })

      const res = await app.inject({
        method: 'PUT',
        url: '/api/configuracoes',
        payload: { nomeFarmacia: 'Farmácia Saúde Plus', corPrimaria: '#FF5500' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().nomeFarmacia).toBe('Farmácia Saúde Plus')
      expect(res.json().corPrimaria).toBe('#FF5500')
    })

    it('deve rejeitar payload inválido — 400', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/configuracoes',
        payload: { nomeFarmacia: '' },
      })

      expect(res.statusCode).toBe(400)
    })

    it('deve rejeitar cor inválida — 400', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/configuracoes',
        payload: { nomeFarmacia: 'Teste', corPrimaria: 'vermelho' },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ==================== GET /api/configuracoes ====================

  describe('GET /api/configuracoes', () => {
    it('deve retornar configuração — 200', async () => {
      await app.inject({
        method: 'PUT',
        url: '/api/configuracoes',
        payload: { nomeFarmacia: 'Farmácia Saúde' },
      })

      const res = await app.inject({ method: 'GET', url: '/api/configuracoes' })

      expect(res.statusCode).toBe(200)
      expect(res.json().nomeFarmacia).toBe('Farmácia Saúde')
    })

    it('deve retornar 404 sem configuração', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/configuracoes' })

      expect(res.statusCode).toBe(404)
    })
  })
})
