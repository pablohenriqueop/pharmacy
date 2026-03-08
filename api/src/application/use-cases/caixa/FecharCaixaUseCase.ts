import type { ICaixaRepository } from '@/application/repositories/ICaixaRepository.ts'
import { CaixaNaoEncontradoError, CaixaJaFechadoError } from '@/domain/errors/CaixaErrors.ts'

export class FecharCaixaUseCase {
  constructor(private readonly caixaRepo: ICaixaRepository) {}

  async execute(tenantId: string, id: string, valorFechamento: number) {
    const caixa = await this.caixaRepo.buscarPorId(tenantId, id)
    if (!caixa) {
      throw new CaixaNaoEncontradoError(id)
    }
    if (!caixa.estaAberto) {
      throw new CaixaJaFechadoError(id)
    }

    const fechado = await this.caixaRepo.fechar(tenantId, id, valorFechamento)
    return fechado!
  }
}
