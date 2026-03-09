import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CategoriaResponse, CriarCategoriaRequest, AtualizarCategoriaRequest } from '@shared/categoria'

export function useCategorias(ativo?: boolean) {
  const params = new URLSearchParams()
  if (ativo !== undefined) params.set('ativo', String(ativo))

  return useQuery<CategoriaResponse[]>({
    queryKey: ['categorias', ativo],
    queryFn: async () => {
      const { data } = await api.get<CategoriaResponse[]>(`/api/categorias?${params}`)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCriarCategoria() {
  const queryClient = useQueryClient()

  return useMutation<CategoriaResponse, Error, CriarCategoriaRequest>({
    mutationFn: async (input) => {
      const { data } = await api.post<CategoriaResponse>('/api/categorias', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

export function useAtualizarCategoria() {
  const queryClient = useQueryClient()

  return useMutation<CategoriaResponse, Error, { id: string } & AtualizarCategoriaRequest>({
    mutationFn: async ({ id, ...input }) => {
      const { data } = await api.put<CategoriaResponse>(`/api/categorias/${id}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

export function useDesativarCategoria() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/categorias/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}
