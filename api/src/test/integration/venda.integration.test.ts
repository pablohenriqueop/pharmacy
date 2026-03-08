import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { buildTestApp } from './setup.ts'
import { limparBanco, seedProduto, seedCaixa } from './helpers.ts'
import type { FastifyInstance } from 'fastify'

describe('Venda — Integração', () => {
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

  // ==================== POST /api/vendas ====================

  describe('POST /api/vendas', () => {
    it('deve criar venda com sucesso — 201', async () => {
      const produto = await seedProduto({ estoqueAtual: 50 })
      const caixa = await seedCaixa()

      const res = await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'DINHEIRO',
          valorPago: 20,
          itens: [{ produtoId: produto.id, quantidade: 2, precoUnit: 8.5 }],
        },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(Number(body.total)).toBe(17)
      expect(Number(body.troco)).toBe(3)
      expect(body.status).toBe('CONCLUIDA')
    })

    it('deve rejeitar venda sem itens — 400', async () => {
      const caixa = await seedCaixa()

      const res = await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [],
        },
      })

      expect(res.statusCode).toBe(400)
    })

    it('deve rejeitar estoque insuficiente — 422', async () => {
      const produto = await seedProduto({ estoqueAtual: 1 })
      const caixa = await seedCaixa()

      const res = await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [{ produtoId: produto.id, quantidade: 999, precoUnit: 8.5 }],
        },
      })

      expect(res.statusCode).toBe(422)
    })

    it('deve rejeitar caixa fechado — 409', async () => {
      const produto = await seedProduto({ estoqueAtual: 50 })
      const caixa = await seedCaixa({ status: 'FECHADO', valorFechamento: '500.00', fechamentoEm: new Date() })

      const res = await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [{ produtoId: produto.id, quantidade: 1, precoUnit: 8.5 }],
        },
      })

      expect(res.statusCode).toBe(409)
    })
  })

  // ==================== GET /api/vendas/:id ====================

  describe('GET /api/vendas/:id', () => {
    it('deve buscar venda por id — 200', async () => {
      const produto = await seedProduto({ estoqueAtual: 50 })
      const caixa = await seedCaixa()

      const createRes = await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [{ produtoId: produto.id, quantidade: 1, precoUnit: 8.5 }],
        },
      })

      const vendaId = createRes.json().id

      const res = await app.inject({ method: 'GET', url: `/api/vendas/${vendaId}` })

      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(vendaId)
    })

    it('deve retornar 404 para venda inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/vendas/00000000-0000-0000-0000-000000000099',
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ==================== GET /api/vendas/caixa/:caixaId ====================

  describe('GET /api/vendas/caixa/:caixaId', () => {
    it('deve listar vendas de um caixa — 200', async () => {
      const produto = await seedProduto({ estoqueAtual: 50 })
      const caixa = await seedCaixa()

      await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [{ produtoId: produto.id, quantidade: 1, precoUnit: 8.5 }],
        },
      })

      const res = await app.inject({ method: 'GET', url: `/api/vendas/caixa/${caixa.id}` })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(1)
    })
  })

  // ==================== POST /api/vendas/:id/cancelar ====================

  describe('POST /api/vendas/:id/cancelar', () => {
    it('deve cancelar venda e estornar estoque — 200', async () => {
      const produto = await seedProduto({ estoqueAtual: 50 })
      const caixa = await seedCaixa()

      const createRes = await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'DINHEIRO',
          valorPago: 20,
          itens: [{ produtoId: produto.id, quantidade: 3, precoUnit: 8.5 }],
        },
      })

      const vendaId = createRes.json().id

      const res = await app.inject({
        method: 'POST',
        url: `/api/vendas/${vendaId}/cancelar`,
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().status).toBe('CANCELADA')
    })

    it('deve retornar 404 para venda inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/vendas/00000000-0000-0000-0000-000000000099/cancelar',
      })

      expect(res.statusCode).toBe(404)
    })
  })
})
