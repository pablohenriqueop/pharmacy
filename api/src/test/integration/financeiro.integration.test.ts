import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test'
import { buildTestApp } from './setup.ts'
import { limparBanco } from './helpers.ts'
import type { FastifyInstance } from 'fastify'

describe('Financeiro — Integração', () => {
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

  // ==================== POST /api/financeiro/contas ====================

  describe('POST /api/financeiro/contas', () => {
    it('deve criar conta a pagar — 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: {
          tipo: 'PAGAR',
          descricao: 'Fornecedor de medicamentos',
          valor: 1500,
          dataVencimento: '2026-03-15',
        },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.tipo).toBe('PAGAR')
      expect(body.status).toBe('PENDENTE')
    })

    it('deve criar conta a receber — 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: {
          tipo: 'RECEBER',
          descricao: 'Venda fiado',
          valor: 85,
          categoria: 'Fiado',
          dataVencimento: '2026-03-20',
        },
      })

      expect(res.statusCode).toBe(201)
      expect(res.json().tipo).toBe('RECEBER')
    })

    it('deve rejeitar payload inválido — 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'INVALIDO', valor: -10 },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ==================== GET /api/financeiro/contas ====================

  describe('GET /api/financeiro/contas', () => {
    it('deve listar contas — 200', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'PAGAR', descricao: 'Conta 1', valor: 100, dataVencimento: '2026-03-10' },
      })

      await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'RECEBER', descricao: 'Conta 2', valor: 200, dataVencimento: '2026-03-15' },
      })

      const res = await app.inject({ method: 'GET', url: '/api/financeiro/contas' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(2)
    })

    it('deve filtrar por tipo — 200', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'PAGAR', descricao: 'Conta', valor: 100, dataVencimento: '2026-03-10' },
      })

      const res = await app.inject({ method: 'GET', url: '/api/financeiro/contas?tipo=RECEBER' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(0)
    })
  })

  // ==================== POST /api/financeiro/contas/:id/pagar ====================

  describe('POST /api/financeiro/contas/:id/pagar', () => {
    it('deve pagar conta — 200', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'PAGAR', descricao: 'Conta', valor: 100, dataVencimento: '2026-03-10' },
      })

      const id = createRes.json().id

      const res = await app.inject({ method: 'POST', url: `/api/financeiro/contas/${id}/pagar` })

      expect(res.statusCode).toBe(200)
      expect(res.json().status).toBe('PAGA')
    })

    it('deve retornar 404 para conta inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas/00000000-0000-0000-0000-000000000099/pagar',
      })

      expect(res.statusCode).toBe(404)
    })

    it('deve retornar 409 para conta já paga', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'PAGAR', descricao: 'Conta', valor: 100, dataVencimento: '2026-03-10' },
      })

      const id = createRes.json().id
      await app.inject({ method: 'POST', url: `/api/financeiro/contas/${id}/pagar` })

      const res = await app.inject({ method: 'POST', url: `/api/financeiro/contas/${id}/pagar` })
      expect(res.statusCode).toBe(409)
    })
  })

  // ==================== POST /api/financeiro/contas/:id/cancelar ====================

  describe('POST /api/financeiro/contas/:id/cancelar', () => {
    it('deve cancelar conta — 200', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'PAGAR', descricao: 'Conta', valor: 100, dataVencimento: '2026-03-10' },
      })

      const id = createRes.json().id

      const res = await app.inject({ method: 'POST', url: `/api/financeiro/contas/${id}/cancelar` })

      expect(res.statusCode).toBe(200)
      expect(res.json().status).toBe('CANCELADA')
    })

    it('deve retornar 409 para conta já paga', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/financeiro/contas',
        payload: { tipo: 'PAGAR', descricao: 'Conta', valor: 100, dataVencimento: '2026-03-10' },
      })

      const id = createRes.json().id
      await app.inject({ method: 'POST', url: `/api/financeiro/contas/${id}/pagar` })

      const res = await app.inject({ method: 'POST', url: `/api/financeiro/contas/${id}/cancelar` })
      expect(res.statusCode).toBe(409)
    })
  })

  // ==================== GET /api/financeiro/fluxo-caixa ====================

  describe('GET /api/financeiro/fluxo-caixa', () => {
    it('deve retornar fluxo vazio — 200', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/financeiro/fluxo-caixa?dataInicio=2026-03-01&dataFim=2026-03-31',
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(0)
    })

    it('deve rejeitar sem parâmetros — 400', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/financeiro/fluxo-caixa' })

      expect(res.statusCode).toBe(400)
    })
  })
})
