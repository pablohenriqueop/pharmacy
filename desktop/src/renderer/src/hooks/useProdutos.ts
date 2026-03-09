import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ProdutoResponse, CriarProdutoRequest, AtualizarProdutoRequest } from '@shared/produto'
import type { ResultadoPaginado } from '@shared/api'

// ─── Catálogo (cache local para PDV) ────────────────────────────

export function useCatalogoProdutos() {
  return useQuery<ProdutoResponse[]>({
    queryKey: ['catalogo-produtos'],
    queryFn: async () => {
      const { data } = await api.get<ProdutoResponse[]>('/api/produtos/catalogo')
      return data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useBuscarProdutos(busca: string) {
  const { data: catalogo, isLoading } = useCatalogoProdutos()

  const resultados = useMemo(() => {
    if (!catalogo || busca.length < 1) return []

    const termo = busca.trim().toLowerCase()

    if (/^\d{3,}$/.test(termo)) {
      return catalogo.filter((p) => p.codigoBarras?.startsWith(termo))
    }

    const palavras = termo.split(/\s+/)
    return catalogo.filter((p) => {
      const nome = p.nome.toLowerCase()
      return palavras.every((palavra) => nome.includes(palavra))
    })
  }, [catalogo, busca])

  return { resultados, isLoading }
}

// ─── Listagem paginada (página Produtos) ────────────────────────

interface FiltrosProduto {
  nome?: string
  categoria?: string
  ativo?: boolean
}

export function useListarProdutos(pagina: number, porPagina = 20, filtros?: FiltrosProduto) {
  const params: Record<string, string | number | boolean | undefined> = {
    nome: filtros?.nome || undefined,
    categoria: filtros?.categoria || undefined,
    ativo: filtros?.ativo,
  }

  return useQuery<ResultadoPaginado<ProdutoResponse>>({
    queryKey: ['produtos', pagina, porPagina, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('pagina', String(pagina))
      searchParams.set('porPagina', String(porPagina))
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') searchParams.set(k, String(v))
      }
      const { data } = await api.get<ResultadoPaginado<ProdutoResponse>>(`/api/produtos?${searchParams}`)
      return data
    },
    placeholderData: keepPreviousData,
  })
}

// ─── Mutations (CRUD) ───────────────────────────────────────────

const INVALIDATE_KEYS = [['produtos'], ['catalogo-produtos']]

export function useCriarProduto() {
  const queryClient = useQueryClient()

  return useMutation<ProdutoResponse, Error, CriarProdutoRequest>({
    mutationFn: async (input) => {
      const { data } = await api.post<ProdutoResponse>('/api/produtos', input)
      return data
    },
    onSuccess: () => {
      INVALIDATE_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
  })
}

export function useAtualizarProduto(id: string) {
  const queryClient = useQueryClient()

  return useMutation<ProdutoResponse, Error, AtualizarProdutoRequest>({
    mutationFn: async (input) => {
      const { data } = await api.put<ProdutoResponse>(`/api/produtos/${id}`, input)
      return data
    },
    onSuccess: () => {
      INVALIDATE_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
  })
}

export function useDesativarProduto() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; pin: string }>({
    mutationFn: async ({ id, pin }) => {
      await api.delete(`/api/produtos/${id}`, { headers: { 'X-Pin': pin } })
    },
    onSuccess: () => {
      INVALIDATE_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
  })
}
