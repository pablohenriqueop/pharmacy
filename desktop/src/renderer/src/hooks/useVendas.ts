import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { VendaResponse } from '@shared/venda'
import type { ResultadoPaginado } from '@shared/api'

export function useListarVendas(caixaId: string | undefined, pagina = 1, porPagina = 20) {
  return useQuery<ResultadoPaginado<VendaResponse>>({
    queryKey: ['vendas', caixaId, pagina, porPagina],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('pagina', String(pagina))
      params.set('porPagina', String(porPagina))
      const { data } = await api.get<ResultadoPaginado<VendaResponse>>(
        `/api/vendas/caixa/${caixaId}?${params}`,
      )
      return data
    },
    enabled: !!caixaId,
  })
}

export function useBuscarVenda(id: string | undefined) {
  return useQuery<VendaResponse>({
    queryKey: ['venda', id],
    queryFn: async () => {
      const { data } = await api.get<VendaResponse>(`/api/vendas/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCancelarVenda() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; pin: string }>({
    mutationFn: async ({ id, pin }) => {
      await api.post(`/api/vendas/${id}/cancelar`, {}, { headers: { 'X-Pin': pin } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['catalogo-produtos'] })
    },
  })
}
