import { describe, it, expect, beforeEach } from 'bun:test'
import { EmitirNfceUseCase } from '../EmitirNfceUseCase.ts'
import { InMemoryNfceRepository } from '@/test/repositories/InMemoryNfceRepository.ts'
import { InMemoryVendaRepository } from '@/test/repositories/InMemoryVendaRepository.ts'
import { InMemoryCaixaRepository } from '@/test/repositories/InMemoryCaixaRepository.ts'
import { InMemoryProdutoRepository } from '@/test/repositories/InMemoryProdutoRepository.ts'
import { CriarVendaUseCase } from '@/application/use-cases/venda/CriarVendaUseCase.ts'
import { VendaNaoEncontradaError, VendaJaCanceladaError } from '@/domain/errors/VendaErrors.ts'
import { NfceEmissaoFalhouError } from '@/domain/errors/NfceErrors.ts'
import type { INfceService, NfceEmissaoResult, NfceCancelamentoResult } from '@/application/services/INfceService.ts'
import type { Venda } from '@/domain/entities/Venda.ts'

const TENANT = '00000000-0000-0000-0000-000000000001'

function criarMockNfceService(overrides: Partial<NfceEmissaoResult> = {}): INfceService {
  return {
    async emitir(_venda: Venda): Promise<NfceEmissaoResult> {
      return {
        chave: '35250612345678901234550010000000011123456789',
        numero: 1,
        serie: 1,
        xml: '<nfeProc></nfeProc>',
        protocolo: '135250600000001',
        status: 'AUTORIZADA',
        ...overrides,
      }
    },
    async cancelar(): Promise<NfceCancelamentoResult> {
      return { protocolo: '235250600000001', status: 'CANCELADA' }
    },
  }
}

describe('EmitirNfceUseCase', () => {
  let nfceRepo: InMemoryNfceRepository
  let vendaRepo: InMemoryVendaRepository
  let sut: EmitirNfceUseCase
  let vendaId: string

  beforeEach(async () => {
    nfceRepo = new InMemoryNfceRepository()
    vendaRepo = new InMemoryVendaRepository()
    const produtoRepo = new InMemoryProdutoRepository()
    const caixaRepo = new InMemoryCaixaRepository()

    const produto = await produtoRepo.criar({
      tenantId: TENANT,
      nome: 'Dipirona 500mg',
      precoVenda: 8.5,
      estoqueAtual: 50,
    })

    const caixa = await caixaRepo.abrir({ tenantId: TENANT, valorAbertura: 100 })

    const criarVenda = new CriarVendaUseCase(vendaRepo, produtoRepo, caixaRepo)
    const venda = await criarVenda.execute({
      tenantId: TENANT,
      caixaId: caixa.id,
      formaPagamento: 'PIX',
      itens: [{ produtoId: produto.id, quantidade: 2, precoUnit: 8.5 }],
    })

    vendaId = venda.id
    sut = new EmitirNfceUseCase(nfceRepo, vendaRepo, criarMockNfceService())
  })

  it('deve emitir NFC-e com sucesso', async () => {
    const nfce = await sut.execute({ tenantId: TENANT, vendaId })

    expect(nfce.status).toBe('AUTORIZADA')
    expect(nfce.chave).toHaveLength(44)
    expect(nfce.vendaId).toBe(vendaId)
    expect(nfceRepo.items).toHaveLength(1)
  })

  it('deve atualizar nfceChave na venda', async () => {
    await sut.execute({ tenantId: TENANT, vendaId })

    const venda = await vendaRepo.buscarPorId(TENANT, vendaId)
    expect(venda!.props.nfceChave).toBe('35250612345678901234550010000000011123456789')
  })

  it('deve rejeitar venda inexistente', async () => {
    expect(
      sut.execute({ tenantId: TENANT, vendaId: 'inexistente' })
    ).rejects.toBeInstanceOf(VendaNaoEncontradaError)
  })

  it('deve rejeitar venda cancelada', async () => {
    await vendaRepo.cancelar(TENANT, vendaId)

    expect(
      sut.execute({ tenantId: TENANT, vendaId })
    ).rejects.toBeInstanceOf(VendaJaCanceladaError)
  })

  it('deve rejeitar quando SEFAZ rejeita emissão', async () => {
    const serviceRejeitada = criarMockNfceService({ status: 'REJEITADA', motivo: 'CNPJ inválido' })
    const sutRejeitada = new EmitirNfceUseCase(nfceRepo, vendaRepo, serviceRejeitada)

    expect(
      sutRejeitada.execute({ tenantId: TENANT, vendaId })
    ).rejects.toBeInstanceOf(NfceEmissaoFalhouError)
  })
})
