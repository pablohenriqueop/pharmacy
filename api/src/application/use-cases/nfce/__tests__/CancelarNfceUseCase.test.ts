import { describe, it, expect, beforeEach } from 'bun:test'
import { CancelarNfceUseCase } from '../CancelarNfceUseCase.ts'
import { InMemoryNfceRepository } from '@/test/repositories/InMemoryNfceRepository.ts'
import { NfceNaoEncontradaError, NfceJaCanceladaError, NfceCancelamentoFalhouError } from '@/domain/errors/NfceErrors.ts'
import type { INfceService, NfceEmissaoResult, NfceCancelamentoResult } from '@/application/services/INfceService.ts'
import type { Venda } from '@/domain/entities/Venda.ts'
import type { Nfce } from '@/domain/entities/Nfce.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

function criarMockService(shouldFail = false): INfceService {
  return {
    async emitir(): Promise<NfceEmissaoResult> {
      return { chave: '', numero: 1, serie: 1, xml: '', protocolo: '', status: 'AUTORIZADA' }
    },
    async cancelar(): Promise<NfceCancelamentoResult> {
      if (shouldFail) throw new Error('SEFAZ offline')
      return { protocolo: '235250600000001', status: 'CANCELADA' }
    },
  }
}

describe('CancelarNfceUseCase', () => {
  let nfceRepo: InMemoryNfceRepository
  let sut: CancelarNfceUseCase
  let nfce: Nfce

  beforeEach(async () => {
    nfceRepo = new InMemoryNfceRepository()
    sut = new CancelarNfceUseCase(nfceRepo, criarMockService())

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

  it('deve cancelar NFC-e com sucesso', async () => {
    const cancelada = await sut.execute({
      tenantId: TENANT,
      nfceId: nfce.id,
      motivo: 'Erro no valor da venda realizada',
    })

    expect(cancelada.status).toBe('CANCELADA')
    expect(cancelada.motivoCancelamento).toBe('Erro no valor da venda realizada')
  })

  it('deve rejeitar NFC-e inexistente', async () => {
    expect(
      sut.execute({ tenantId: TENANT, nfceId: 'inexistente', motivo: 'Motivo de teste longo o suficiente' })
    ).rejects.toBeInstanceOf(NfceNaoEncontradaError)
  })

  it('deve rejeitar NFC-e já cancelada', async () => {
    await nfceRepo.cancelar(TENANT, nfce.id, 'Cancelamento anterior')

    expect(
      sut.execute({ tenantId: TENANT, nfceId: nfce.id, motivo: 'Tentativa de recancelar' })
    ).rejects.toBeInstanceOf(NfceJaCanceladaError)
  })

  it('deve rejeitar quando SEFAZ falha', async () => {
    const sutFalha = new CancelarNfceUseCase(nfceRepo, criarMockService(true))

    expect(
      sutFalha.execute({ tenantId: TENANT, nfceId: nfce.id, motivo: 'Erro no valor da venda' })
    ).rejects.toBeInstanceOf(NfceCancelamentoFalhouError)
  })
})
