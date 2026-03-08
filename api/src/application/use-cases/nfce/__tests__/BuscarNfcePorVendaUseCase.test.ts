import { describe, it, expect, beforeEach } from 'bun:test'
import { BuscarNfcePorVendaUseCase } from '../BuscarNfcePorVendaUseCase.ts'
import { InMemoryNfceRepository } from '@/test/repositories/InMemoryNfceRepository.ts'
import { NfceNaoEncontradaError } from '@/domain/errors/NfceErrors.ts'
import type { Nfce } from '@/domain/entities/Nfce.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('BuscarNfcePorVendaUseCase', () => {
  let nfceRepo: InMemoryNfceRepository
  let sut: BuscarNfcePorVendaUseCase
  let nfce: Nfce

  beforeEach(async () => {
    nfceRepo = new InMemoryNfceRepository()
    sut = new BuscarNfcePorVendaUseCase(nfceRepo)

    nfce = await nfceRepo.criar({
      tenantId: TENANT,
      vendaId: 'venda-1',
      chave: '35250612345678901234550010000000011123456789',
      numero: 1,
      serie: 1,
      xml: '<nfeProc></nfeProc>',
      protocolo: '135250600000001',
      status: 'AUTORIZADA',
    })
  })

  it('deve buscar NFC-e por vendaId', async () => {
    const resultado = await sut.execute(TENANT, 'venda-1')
    expect(resultado.id).toBe(nfce.id)
    expect(resultado.vendaId).toBe('venda-1')
  })

  it('deve rejeitar quando venda não tem NFC-e', async () => {
    expect(
      sut.execute(TENANT, 'venda-inexistente')
    ).rejects.toBeInstanceOf(NfceNaoEncontradaError)
  })
})
