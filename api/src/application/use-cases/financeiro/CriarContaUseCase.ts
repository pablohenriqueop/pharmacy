import type { CriarContaInput } from '@/domain/entities/Conta.ts'
import type { IContaRepository } from '@/application/repositories/IContaRepository.ts'

export class CriarContaUseCase {
  constructor(private readonly contaRepo: IContaRepository) {}

  async execute(input: CriarContaInput) {
    return this.contaRepo.criar(input)
  }
}
