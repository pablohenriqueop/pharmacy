import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ContaResponse, CriarContaRequest, FluxoCaixaItemResponse } from '@shared/conta'
import type { ResultadoPaginado } from '@shared/api'

interface FiltrosContas {
  tipo?: string
  status?: string
  dataInicio?: string
  dataFim?: string
}

export function useListarContas(pagina = 1, porPagina = 20, filtros?: FiltrosContas) {
  const params: Record<string, string | number | boolean | undefined> = {
    tipo: filtros?.tipo || undefined,
    status: filtros?.status || undefined,
    dataInicio: filtros?.dataInicio || undefined,
    dataFim: filtros?.dataFim || undefined,
  }

  return useQuery<ResultadoPaginado<ContaResponse>>({
    queryKey: ['contas', pagina, porPagina, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('pagina', String(pagina))
      searchParams.set('porPagina', String(porPagina))
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') searchParams.set(k, String(v))
      }
      const { data } = await api.get<ResultadoPaginado<ContaResponse>>(
        `/api/financeiro/contas?${searchParams}`,
      )
      return data
    },
  })
}

export function useCriarConta() {
  const queryClient = useQueryClient()

  return useMutation<ContaResponse, Error, CriarContaRequest>({
    mutationFn: async (input) => {
      const { data } = await api.post<ContaResponse>('/api/financeiro/contas', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      queryClient.invalidateQueries({ queryKey: ['fluxo-caixa'] })
    },
  })
}

export function usePagarConta() {
  const queryClient = useQueryClient()

  return useMutation<ContaResponse, Error, string>({
    mutationFn: async (id) => {
      const { data } = await api.post<ContaResponse>(`/api/financeiro/contas/${id}/pagar`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      queryClient.invalidateQueries({ queryKey: ['fluxo-caixa'] })
    },
  })
}

export function useCancelarConta() {
  const queryClient = useQueryClient()

  return useMutation<ContaResponse, Error, string>({
    mutationFn: async (id) => {
      const { data } = await api.post<ContaResponse>(`/api/financeiro/contas/${id}/cancelar`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] })
      queryClient.invalidateQueries({ queryKey: ['fluxo-caixa'] })
    },
  })
}

export function useFluxoCaixa(dataInicio: string, dataFim: string, enabled = true) {
  return useQuery<FluxoCaixaItemResponse[]>({
    queryKey: ['fluxo-caixa', dataInicio, dataFim],
    queryFn: async () => {
      const params = new URLSearchParams({ dataInicio, dataFim })
      const { data } = await api.get<FluxoCaixaItemResponse[]>(
        `/api/financeiro/fluxo-caixa?${params}`,
      )
      return data
    },
    enabled: enabled && !!dataInicio && !!dataFim,
  })
}
