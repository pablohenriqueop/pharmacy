import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { buildTestApp } from './setup.ts'
import { limparBanco, seedProduto, seedCaixa } from './helpers.ts'
import type { FastifyInstance } from 'fastify'

describe('NFC-e — Integração', () => {
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

  async function criarVendaParaNfce() {
    const produto = await seedProduto({ estoqueAtual: 100 })
    const caixa = await seedCaixa()

    const vendaRes = await app.inject({
      method: 'POST',
      url: '/api/vendas',
      payload: {
        caixaId: caixa.id,
        formaPagamento: 'PIX',
        itens: [{ produtoId: produto.id, quantidade: 2, precoUnit: 10 }],
      },
    })

    return vendaRes.json()
  }

  // ==================== POST /api/nfce/emitir ====================

  describe('POST /api/nfce/emitir', () => {
    it('deve emitir NFC-e com sucesso — 201', async () => {
      const venda = await criarVendaParaNfce()

      const res = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: venda.id },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.status).toBe('AUTORIZADA')
      expect(body.chave).toHaveLength(44)
      expect(body.vendaId).toBe(venda.id)
    })

    it('deve rejeitar venda inexistente — 404', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: 'a0000000-0000-4000-8000-000000000099' },
      })

      expect(res.statusCode).toBe(404)
    })

    it('deve rejeitar venda cancelada — 409', async () => {
      const venda = await criarVendaParaNfce()

      await app.inject({
        method: 'POST',
        url: `/api/vendas/${venda.id}/cancelar`,
      })

      const res = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: venda.id },
      })

      expect(res.statusCode).toBe(409)
    })

    it('deve rejeitar payload inválido — 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: 'nao-e-uuid' },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ==================== GET /api/nfce/:id ====================

  describe('GET /api/nfce/:id', () => {
    it('deve buscar NFC-e por id — 200', async () => {
      const venda = await criarVendaParaNfce()

      const emitirRes = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: venda.id },
      })

      const nfceId = emitirRes.json().id

      const res = await app.inject({ method: 'GET', url: `/api/nfce/${nfceId}` })

      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(nfceId)
    })

    it('deve retornar 404 para NFC-e inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/nfce/00000000-0000-0000-0000-000000000099',
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ==================== GET /api/nfce/venda/:vendaId ====================

  describe('GET /api/nfce/venda/:vendaId', () => {
    it('deve buscar NFC-e por vendaId — 200', async () => {
      const venda = await criarVendaParaNfce()

      await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: venda.id },
      })

      const res = await app.inject({ method: 'GET', url: `/api/nfce/venda/${venda.id}` })

      expect(res.statusCode).toBe(200)
      expect(res.json().vendaId).toBe(venda.id)
    })

    it('deve retornar 404 quando venda não tem NFC-e', async () => {
      const venda = await criarVendaParaNfce()

      const res = await app.inject({ method: 'GET', url: `/api/nfce/venda/${venda.id}` })

      expect(res.statusCode).toBe(404)
    })
  })

  // ==================== POST /api/nfce/:id/cancelar ====================

  describe('POST /api/nfce/:id/cancelar', () => {
    it('deve cancelar NFC-e com sucesso — 200', async () => {
      const venda = await criarVendaParaNfce()

      const emitirRes = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: venda.id },
      })

      const nfceId = emitirRes.json().id

      const res = await app.inject({
        method: 'POST',
        url: `/api/nfce/${nfceId}/cancelar`,
        payload: { motivo: 'Erro no valor da venda realizada' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().status).toBe('CANCELADA')
      expect(res.json().motivoCancelamento).toBe('Erro no valor da venda realizada')
    })

    it('deve retornar 404 para NFC-e inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/nfce/00000000-0000-0000-0000-000000000099/cancelar',
        payload: { motivo: 'Motivo de cancelamento teste' },
      })

      expect(res.statusCode).toBe(404)
    })

    it('deve retornar 409 para NFC-e já cancelada', async () => {
      const venda = await criarVendaParaNfce()

      const emitirRes = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: venda.id },
      })

      const nfceId = emitirRes.json().id

      await app.inject({
        method: 'POST',
        url: `/api/nfce/${nfceId}/cancelar`,
        payload: { motivo: 'Erro no valor da venda realizada' },
      })

      const res = await app.inject({
        method: 'POST',
        url: `/api/nfce/${nfceId}/cancelar`,
        payload: { motivo: 'Tentativa de recancelar nota' },
      })

      expect(res.statusCode).toBe(409)
    })

    it('deve rejeitar motivo curto — 400', async () => {
      const venda = await criarVendaParaNfce()

      const emitirRes = await app.inject({
        method: 'POST',
        url: '/api/nfce/emitir',
        payload: { vendaId: venda.id },
      })

      const nfceId = emitirRes.json().id

      const res = await app.inject({
        method: 'POST',
        url: `/api/nfce/${nfceId}/cancelar`,
        payload: { motivo: 'curto' },
      })

      expect(res.statusCode).toBe(400)
    })
  })
})
