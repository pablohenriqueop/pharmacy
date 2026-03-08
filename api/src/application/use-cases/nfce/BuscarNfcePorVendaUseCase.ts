import type { INfceRepository } from '@/application/repositories/INfceRepository.ts'
import { NfceNaoEncontradaError } from '@/domain/errors/NfceErrors.ts'

export class BuscarNfcePorVendaUseCase {
  constructor(private readonly nfceRepo: INfceRepository) {}

  async execute(tenantId: string, vendaId: string) {
    const nfce = await this.nfceRepo.buscarPorVendaId(tenantId, vendaId)
    if (!nfce) {
      throw new NfceNaoEncontradaError(vendaId)
    }
    return nfce
  }
}
