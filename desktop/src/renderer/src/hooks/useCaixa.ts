import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CaixaResponse } from '@shared/caixa'

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
