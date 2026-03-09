export interface ApiError {
  error: string
  details?: unknown
}

export interface ResultadoPaginado<T> {
  dados: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}
