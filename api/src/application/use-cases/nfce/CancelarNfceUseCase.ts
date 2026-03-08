import type { CancelarNfceInput } from '@/domain/entities/Nfce.ts'
import type { INfceRepository } from '@/application/repositories/INfceRepository.ts'
import type { INfceService } from '@/application/services/INfceService.ts'
import { NfceNaoEncontradaError, NfceJaCanceladaError, NfceCancelamentoFalhouError } from '@/domain/errors/NfceErrors.ts'

export class CancelarNfceUseCase {
  constructor(
    private readonly nfceRepo: INfceRepository,
    private readonly nfceService: INfceService,
  ) {}

  async execute(input: CancelarNfceInput) {
    const nfce = await this.nfceRepo.buscarPorId(input.tenantId, input.nfceId)
    if (!nfce) {
      throw new NfceNaoEncontradaError(input.nfceId)
    }
    if (nfce.estaCancelada) {
      throw new NfceJaCanceladaError(input.nfceId)
    }

    try {
      await this.nfceService.cancelar(nfce.chave, input.motivo)
    } catch {
      throw new NfceCancelamentoFalhouError('Erro ao comunicar com a SEFAZ')
    }

    const cancelada = await this.nfceRepo.cancelar(input.tenantId, input.nfceId, input.motivo)
    return cancelada!
  }
}
