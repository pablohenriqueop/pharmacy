import type { ICategoriaRepository } from '@/application/repositories/ICategoriaRepository.ts'
import type { CriarCategoriaInput } from '@/domain/entities/Categoria.ts'
import type { Categoria } from '@/domain/entities/Categoria.ts'
import { CategoriaDuplicadaError } from '@/domain/errors/CategoriaErrors.ts'

export class CadastrarCategoriaUseCase {
  constructor(private readonly repo: ICategoriaRepository) {}

  async execute(input: CriarCategoriaInput): Promise<Categoria> {
    const existente = await this.repo.buscarPorNome(input.tenantId, input.nome)
    if (existente) {
      throw new CategoriaDuplicadaError(input.nome)
    }
    return this.repo.criar(input)
  }
}
