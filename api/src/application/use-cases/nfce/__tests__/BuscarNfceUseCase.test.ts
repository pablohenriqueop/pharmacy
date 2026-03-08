import { describe, it, expect, beforeEach } from 'bun:test'
import { BuscarNfceUseCase } from '../BuscarNfceUseCase.ts'
import { InMemoryNfceRepository } from '@/test/repositories/InMemoryNfceRepository.ts'
import { NfceNaoEncontradaError } from '@/domain/errors/NfceErrors.ts'
import type { Nfce } from '@/domain/entities/Nfce.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

describe('BuscarNfceUseCase', () => {
  let nfceRepo: InMemoryNfceRepository
  let sut: BuscarNfceUseCase
  let nfce: Nfce

  beforeEach(async () => {
    nfceRepo = new InMemoryNfceRepository()
    sut = new BuscarNfceUseCase(nfceRepo)

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

  it('deve buscar NFC-e por id', async () => {
    const resultado = await sut.execute(TENANT, nfce.id)
    expect(resultado.id).toBe(nfce.id)
    expect(resultado.chave).toBe(nfce.chave)
  })

  it('deve rejeitar NFC-e inexistente', async () => {
    expect(
      sut.execute(TENANT, 'inexistente')
    ).rejects.toBeInstanceOf(NfceNaoEncontradaError)
  })
})
