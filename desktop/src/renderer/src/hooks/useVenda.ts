import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CriarVendaRequest, VendaResponse } from '@shared/venda'

export function useCriarVenda() {
  const queryClient = useQueryClient()

  return useMutation<VendaResponse, Error, CriarVendaRequest>({
    mutationFn: async (input) => {
      const { data } = await api.post<VendaResponse>('/api/vendas', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
    },
  })
}
