import type { IConfiguracaoRepository } from '@/application/repositories/IConfiguracaoRepository.ts'
import { ConfiguracaoNaoEncontradaError } from '@/domain/errors/ConfiguracaoErrors.ts'

export class BuscarConfiguracaoUseCase {
  constructor(private readonly repo: IConfiguracaoRepository) {}

  async execute(tenantId: string) {
    const config = await this.repo.buscarPorTenantId(tenantId)
    if (!config) {
      throw new ConfiguracaoNaoEncontradaError(tenantId)
    }
    return config
  }
}
