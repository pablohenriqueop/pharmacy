import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { buildTestApp } from './setup.ts'
import { limparBanco, seedProduto, seedCaixa } from './helpers.ts'
import type { FastifyInstance } from 'fastify'

describe('Relatório — Integração', () => {
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

  // ==================== GET /api/relatorios/vendas ====================

  describe('GET /api/relatorios/vendas', () => {
    it('deve retornar vendas por período — 200', async () => {
      const produto = await seedProduto({ estoqueAtual: 100 })
      const caixa = await seedCaixa()

      await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [{ produtoId: produto.id, quantidade: 2, precoUnit: 10 }],
        },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/vendas?dataInicio=2020-01-01&dataFim=2030-12-31',
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body).toHaveLength(1)
      expect(body[0].quantidadeVendas).toBe(1)
      expect(body[0].totalVendas).toBe(20)
    })

    it('deve retornar lista vazia sem vendas no período — 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/vendas?dataInicio=2020-01-01&dataFim=2020-01-31',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(0)
    })

    it('deve rejeitar sem parâmetros — 400', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/vendas',
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ==================== GET /api/relatorios/produtos-mais-vendidos ====================

  describe('GET /api/relatorios/produtos-mais-vendidos', () => {
    it('deve retornar ranking de produtos — 200', async () => {
      const produto1 = await seedProduto({ nome: 'Dipirona', estoqueAtual: 100 })
      const produto2 = await seedProduto({ nome: 'Ibuprofeno', estoqueAtual: 100, codigoBarras: '7891234567891' })
      const caixa = await seedCaixa()

      // Vende mais do produto1
      await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [
            { produtoId: produto1.id, quantidade: 10, precoUnit: 8.5 },
            { produtoId: produto2.id, quantidade: 3, precoUnit: 12 },
          ],
        },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/produtos-mais-vendidos?dataInicio=2020-01-01&dataFim=2030-12-31',
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body).toHaveLength(2)
      expect(body[0].nome).toBe('Dipirona')
      expect(body[0].quantidadeVendida).toBe(10)
    })

    it('deve respeitar limite — 200', async () => {
      const produto1 = await seedProduto({ nome: 'Dipirona', estoqueAtual: 100 })
      const produto2 = await seedProduto({ nome: 'Ibuprofeno', estoqueAtual: 100, codigoBarras: '7891234567891' })
      const caixa = await seedCaixa()

      await app.inject({
        method: 'POST',
        url: '/api/vendas',
        payload: {
          caixaId: caixa.id,
          formaPagamento: 'PIX',
          itens: [
            { produtoId: produto1.id, quantidade: 5, precoUnit: 8.5 },
            { produtoId: produto2.id, quantidade: 3, precoUnit: 12 },
          ],
        },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/produtos-mais-vendidos?dataInicio=2020-01-01&dataFim=2030-12-31&limite=1',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(1)
    })

    it('deve retornar lista vazia sem vendas — 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/produtos-mais-vendidos?dataInicio=2020-01-01&dataFim=2020-01-31',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(0)
    })

    it('deve rejeitar sem parâmetros — 400', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/produtos-mais-vendidos',
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ==================== GET /api/relatorios/alertas-estoque ====================

  describe('GET /api/relatorios/alertas-estoque', () => {
    it('deve retornar produtos com estoque baixo — 200', async () => {
      await seedProduto({ nome: 'Dipirona', estoqueAtual: 2, estoqueMinimo: 5 })
      await seedProduto({ nome: 'Ibuprofeno', estoqueAtual: 50, estoqueMinimo: 5, codigoBarras: '7891234567891' })

      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/alertas-estoque',
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body).toHaveLength(1)
      expect(body[0].nome).toBe('Dipirona')
      expect(body[0].estoqueAtual).toBe(2)
    })

    it('deve retornar lista vazia sem alertas — 200', async () => {
      await seedProduto({ estoqueAtual: 100, estoqueMinimo: 5 })

      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/alertas-estoque',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(0)
    })

    it('deve incluir produto com estoque igual ao mínimo — 200', async () => {
      await seedProduto({ estoqueAtual: 5, estoqueMinimo: 5 })

      const res = await app.inject({
        method: 'GET',
        url: '/api/relatorios/alertas-estoque',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(1)
    })
  })
})
