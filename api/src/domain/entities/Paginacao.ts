export interface PaginacaoParams {
  pagina: number
  porPagina: number
}

export interface ResultadoPaginado<T> {
  dados: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

export const PAGINACAO_PADRAO: PaginacaoParams = {
  pagina: 1,
  porPagina: 30,
}
