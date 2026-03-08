import type { AtualizarConfiguracaoInput } from '@/domain/entities/Configuracao.ts'
import type { IConfiguracaoRepository } from '@/application/repositories/IConfiguracaoRepository.ts'

export class AtualizarConfiguracaoUseCase {
  constructor(private readonly repo: IConfiguracaoRepository) {}

  async execute(input: AtualizarConfiguracaoInput) {
    return this.repo.criarOuAtualizar(input)
  }
}
