import type { ICategoriaRepository } from '@/application/repositories/ICategoriaRepository.ts'
import type { AtualizarCategoriaInput, Categoria } from '@/domain/entities/Categoria.ts'
import { CategoriaNaoEncontradaError, CategoriaDuplicadaError } from '@/domain/errors/CategoriaErrors.ts'

export class AtualizarCategoriaUseCase {
  constructor(private readonly repo: ICategoriaRepository) {}

  async execute(tenantId: string, id: string, input: AtualizarCategoriaInput): Promise<Categoria> {
    if (input.nome) {
      const existente = await this.repo.buscarPorNome(tenantId, input.nome)
      if (existente && existente.id !== id) {
        throw new CategoriaDuplicadaError(input.nome)
      }
    }

    const categoria = await this.repo.atualizar(tenantId, id, input)
    if (!categoria) {
      throw new CategoriaNaoEncontradaError(id)
    }
    return categoria
  }
}
