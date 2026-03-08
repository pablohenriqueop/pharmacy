import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { buildTestApp, TENANT_ID } from './setup.ts'
import { limparBanco, seedProduto } from './helpers.ts'
import type { FastifyInstance } from 'fastify'

describe('Produto — Integração', () => {
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

  // ==================== POST /api/produtos ====================

  describe('POST /api/produtos', () => {
    it('deve criar produto com sucesso — 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: {
          nome: 'Dipirona 500mg',
          precoVenda: 8.5,
          codigoBarras: '7891234567890',
          categoria: 'Analgésicos',
        },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.nome).toBe('Dipirona 500mg')
      expect(body.precoVenda).toBe(8.5)
      expect(body.codigoBarras).toBe('7891234567890')
      expect(body.ativo).toBe(true)
    })

    it('deve rejeitar payload inválido — 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: { nome: '', precoVenda: -1 },
      })

      expect(res.statusCode).toBe(400)
    })

    it('deve rejeitar código de barras duplicado — 409', async () => {
      await seedProduto({ codigoBarras: '7891234567890' })

      const res = await app.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: {
          nome: 'Outro Produto',
          precoVenda: 10,
          codigoBarras: '7891234567890',
        },
      })

      expect(res.statusCode).toBe(409)
    })
  })

  // ==================== GET /api/produtos ====================

  describe('GET /api/produtos', () => {
    it('deve listar produtos — 200', async () => {
      await seedProduto({ nome: 'Dipirona' })
      await seedProduto({ nome: 'Ibuprofeno' })

      const res = await app.inject({ method: 'GET', url: '/api/produtos' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(2)
    })

    it('deve filtrar por nome — 200', async () => {
      await seedProduto({ nome: 'Dipirona 500mg' })
      await seedProduto({ nome: 'Ibuprofeno 400mg' })

      const res = await app.inject({ method: 'GET', url: '/api/produtos?nome=dipirona' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(1)
    })

    it('deve retornar lista vazia — 200', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/produtos' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(0)
    })
  })

  // ==================== GET /api/produtos/:id ====================

  describe('GET /api/produtos/:id', () => {
    it('deve buscar produto por id — 200', async () => {
      const produto = await seedProduto()

      const res = await app.inject({ method: 'GET', url: `/api/produtos/${produto.id}` })

      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(produto.id)
    })

    it('deve retornar 404 para id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/produtos/00000000-0000-0000-0000-000000000099',
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ==================== GET /api/produtos/codigo-barras/:codigo ====================

  describe('GET /api/produtos/codigo-barras/:codigo', () => {
    it('deve buscar por código de barras — 200', async () => {
      await seedProduto({ codigoBarras: '7891234567890' })

      const res = await app.inject({
        method: 'GET',
        url: '/api/produtos/codigo-barras/7891234567890',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().codigoBarras).toBe('7891234567890')
    })

    it('deve retornar 404 para código inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/produtos/codigo-barras/0000000000000',
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ==================== PUT /api/produtos/:id ====================

  describe('PUT /api/produtos/:id', () => {
    it('deve atualizar produto — 200', async () => {
      const produto = await seedProduto()

      const res = await app.inject({
        method: 'PUT',
        url: `/api/produtos/${produto.id}`,
        payload: { nome: 'Dipirona Sódica 500mg', precoVenda: 9.5 },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().nome).toBe('Dipirona Sódica 500mg')
    })

    it('deve retornar 404 para produto inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/produtos/00000000-0000-0000-0000-000000000099',
        payload: { nome: 'Teste' },
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ==================== DELETE /api/produtos/:id ====================

  describe('DELETE /api/produtos/:id', () => {
    it('deve desativar produto (soft delete) — 204', async () => {
      const produto = await seedProduto()

      const res = await app.inject({
        method: 'DELETE',
        url: `/api/produtos/${produto.id}`,
      })

      expect(res.statusCode).toBe(204)
    })
  })
})
