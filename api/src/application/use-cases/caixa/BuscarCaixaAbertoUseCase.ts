import type { ICaixaRepository } from '@/application/repositories/ICaixaRepository.ts'
import { NenhumCaixaAbertoError } from '@/domain/errors/CaixaErrors.ts'

export class BuscarCaixaAbertoUseCase {
  constructor(private readonly caixaRepo: ICaixaRepository) {}

  async execute(tenantId: string) {
    const caixa = await this.caixaRepo.buscarAberto(tenantId)
    if (!caixa) {
      throw new NenhumCaixaAbertoError()
    }
    return caixa
  }
}
