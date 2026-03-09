import type { Categoria, CriarCategoriaInput, AtualizarCategoriaInput } from '@/domain/entities/Categoria.ts'

export interface ICategoriaRepository {
  criar(input: CriarCategoriaInput): Promise<Categoria>
  buscarPorId(tenantId: string, id: string): Promise<Categoria | null>
  buscarPorNome(tenantId: string, nome: string): Promise<Categoria | null>
  listar(tenantId: string, filtros?: { ativo?: boolean }): Promise<Categoria[]>
  atualizar(tenantId: string, id: string, input: AtualizarCategoriaInput): Promise<Categoria | null>
}
