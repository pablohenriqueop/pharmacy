import type { INfceRepository } from '@/application/repositories/INfceRepository.ts'
import { NfceNaoEncontradaError } from '@/domain/errors/NfceErrors.ts'

export class BuscarNfceUseCase {
  constructor(private readonly nfceRepo: INfceRepository) {}

  async execute(tenantId: string, id: string) {
    const nfce = await this.nfceRepo.buscarPorId(tenantId, id)
    if (!nfce) {
      throw new NfceNaoEncontradaError(id)
    }
    return nfce
  }
}
