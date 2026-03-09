import { z } from 'zod/v4'
import type { PaginacaoParams } from '@/domain/entities/Paginacao.ts'

export const paginacaoSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(30),
})

export function parsePaginacao(query: unknown): PaginacaoParams {
  return paginacaoSchema.parse(query)
}
