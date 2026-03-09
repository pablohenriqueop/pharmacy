import type { ICategoriaRepository } from '@/application/repositories/ICategoriaRepository.ts'
import type { Categoria } from '@/domain/entities/Categoria.ts'

export class ListarCategoriasUseCase {
  constructor(private readonly repo: ICategoriaRepository) {}

  async execute(tenantId: string, filtros?: { ativo?: boolean }): Promise<Categoria[]> {
    return this.repo.listar(tenantId, filtros)
  }
}
