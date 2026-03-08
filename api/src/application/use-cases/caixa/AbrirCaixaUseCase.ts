import type { ICaixaRepository } from '@/application/repositories/ICaixaRepository.ts'

export class AbrirCaixaUseCase {
  constructor(private readonly caixaRepo: ICaixaRepository) {}

  async execute(tenantId: string, valorAbertura: number) {
    // Verifica se já existe caixa aberto
    const aberto = await this.caixaRepo.buscarAberto(tenantId)
    if (aberto) {
      // Retorna o caixa já aberto em vez de criar outro
      return aberto
    }

    return this.caixaRepo.abrir({ tenantId, valorAbertura })
  }
}
