import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  VendaPorPeriodoResponse,
  ProdutoMaisVendidoResponse,
  AlertaEstoqueResponse,
} from '@shared/relatorio'

export function useRelatorioVendas(dataInicio: string, dataFim: string, enabled = true) {
  return useQuery<VendaPorPeriodoResponse[]>({
    queryKey: ['relatorio-vendas', dataInicio, dataFim],
    queryFn: async () => {
      const params = new URLSearchParams({ dataInicio, dataFim })
      const { data } = await api.get<VendaPorPeriodoResponse[]>(`/api/relatorios/vendas?${params}`)
      return data
    },
    enabled: enabled && !!dataInicio && !!dataFim,
  })
}

export function useProdutosMaisVendidos(dataInicio: string, dataFim: string, limite = 10, enabled = true) {
  return useQuery<ProdutoMaisVendidoResponse[]>({
    queryKey: ['produtos-mais-vendidos', dataInicio, dataFim, limite],
    queryFn: async () => {
      const params = new URLSearchParams({ dataInicio, dataFim, limite: String(limite) })
      const { data } = await api.get<ProdutoMaisVendidoResponse[]>(
        `/api/relatorios/produtos-mais-vendidos?${params}`,
      )
      return data
    },
    enabled: enabled && !!dataInicio && !!dataFim,
  })
}

export function useAlertasEstoque() {
  return useQuery<AlertaEstoqueResponse[]>({
    queryKey: ['alertas-estoque'],
    queryFn: async () => {
      const { data } = await api.get<AlertaEstoqueResponse[]>('/api/relatorios/alertas-estoque')
      return data
    },
  })
}
