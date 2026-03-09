import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ConfiguracaoResponse, AtualizarConfiguracaoRequest } from '@shared/configuracao'

export function useConfiguracao() {
  return useQuery<ConfiguracaoResponse>({
    queryKey: ['configuracao'],
    queryFn: async () => {
      const { data } = await api.get<ConfiguracaoResponse>('/api/configuracoes')
      return data
    },
  })
}

export function useAtualizarConfiguracao() {
  const queryClient = useQueryClient()

  return useMutation<ConfiguracaoResponse, Error, AtualizarConfiguracaoRequest>({
    mutationFn: async (input) => {
      const { data } = await api.put<ConfiguracaoResponse>('/api/configuracoes', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracao'] })
    },
  })
}
