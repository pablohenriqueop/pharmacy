import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AxiosError } from 'axios'
import type { ResultadoPaginado } from '@shared/api'

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error: string }>
  return axiosError.response?.data?.error ?? 'Erro de conexão'
}

export function useGet<T>(key: string[], path: string, enabled = true) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<T>(path)
      return data
    },
    enabled,
  })
}

export function useGetPaginado<T>(
  key: string[],
  path: string,
  pagina: number,
  porPagina = 30,
  filtros?: Record<string, string | number | boolean | undefined>,
  enabled = true,
) {
  const params = new URLSearchParams()
  params.set('pagina', String(pagina))
  params.set('porPagina', String(porPagina))

  if (filtros) {
    for (const [k, v] of Object.entries(filtros)) {
      if (v !== undefined && v !== '') params.set(k, String(v))
    }
  }

  const url = `${path}?${params.toString()}`

  return useQuery<ResultadoPaginado<T>>({
    queryKey: [...key, pagina, porPagina, filtros],
    queryFn: async () => {
      const { data } = await api.get<ResultadoPaginado<T>>(url)
      return data
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function usePost<TInput, TOutput>(path: string, invalidateKeys?: string[][]) {
  const queryClient = useQueryClient()

  return useMutation<TOutput, Error, TInput>({
    mutationFn: async (input) => {
      const { data } = await api.post<TOutput>(path, input)
      return data
    },
    onSuccess: () => {
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    meta: { getErrorMessage },
  })
}

export function usePut<TInput, TOutput>(path: string, invalidateKeys?: string[][]) {
  const queryClient = useQueryClient()

  return useMutation<TOutput, Error, TInput>({
    mutationFn: async (input) => {
      const { data } = await api.put<TOutput>(path, input)
      return data
    },
    onSuccess: () => {
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    meta: { getErrorMessage },
  })
}

export function useDelete<TOutput>(path: string, invalidateKeys?: string[][]) {
  const queryClient = useQueryClient()

  return useMutation<TOutput, Error, void>({
    mutationFn: async () => {
      const { data } = await api.delete<TOutput>(path)
      return data
    },
    onSuccess: () => {
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    meta: { getErrorMessage },
  })
}

export { getErrorMessage }
