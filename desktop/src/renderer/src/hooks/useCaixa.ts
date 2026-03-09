import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CaixaResponse, FecharCaixaRequest } from '@shared/caixa'

export function useCaixaAberto() {
  return useQuery<CaixaResponse | null>({
    queryKey: ['caixa-aberto'],
    queryFn: async () => {
      try {
        const { data } = await api.get<CaixaResponse>('/api/caixas/aberto')
        return data
      } catch {
        return null
      }
    },
    refetchInterval: 30_000,
  })
}

export function useFecharCaixa() {
  const queryClient = useQueryClient()

  return useMutation<CaixaResponse, Error, { id: string; valorFechamento: number }>({
    mutationFn: async ({ id, valorFechamento }) => {
      const { data } = await api.post<CaixaResponse>(`/api/caixas/${id}/fechar`, {
        valorFechamento,
      } satisfies FecharCaixaRequest)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-aberto'] })
      queryClient.invalidateQueries({ queryKey: ['vendas'] })
    },
  })
}
