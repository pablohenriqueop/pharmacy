import type { EmitirNfceInput } from '@/domain/entities/Nfce.ts'
import type { INfceRepository } from '@/application/repositories/INfceRepository.ts'
import type { IVendaRepository } from '@/application/repositories/IVendaRepository.ts'
import type { INfceService } from '@/application/services/INfceService.ts'
import { VendaNaoEncontradaError, VendaJaCanceladaError } from '@/domain/errors/VendaErrors.ts'
import { NfceEmissaoFalhouError } from '@/domain/errors/NfceErrors.ts'

export class EmitirNfceUseCase {
  constructor(
    private readonly nfceRepo: INfceRepository,
    private readonly vendaRepo: IVendaRepository,
    private readonly nfceService: INfceService,
  ) {}

  async execute(input: EmitirNfceInput) {
    const venda = await this.vendaRepo.buscarPorId(input.tenantId, input.vendaId)
    if (!venda) {
      throw new VendaNaoEncontradaError(input.vendaId)
    }
    if (venda.estaCancelada) {
      throw new VendaJaCanceladaError(input.vendaId)
    }

    const resultado = await this.nfceService.emitir(venda)

    if (resultado.status === 'REJEITADA') {
      throw new NfceEmissaoFalhouError(resultado.motivo ?? 'Motivo desconhecido')
    }

    const nfce = await this.nfceRepo.criar({
      tenantId: input.tenantId,
      vendaId: input.vendaId,
      chave: resultado.chave,
      numero: resultado.numero,
      serie: resultado.serie,
      xml: resultado.xml,
      protocolo: resultado.protocolo,
      status: resultado.status,
    })

    await this.vendaRepo.atualizarNfceChave(input.tenantId, input.vendaId, resultado.chave)

    return nfce
  }
}
