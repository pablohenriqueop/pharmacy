import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ProdutoResponse } from '@shared/produto'

export function useBuscarProdutos(nome?: string) {
  return useQuery<ProdutoResponse[]>({
    queryKey: ['produtos', nome],
    queryFn: async () => {
      const params = nome ? `?nome=${encodeURIComponent(nome)}` : ''
      const { data } = await api.get<ProdutoResponse[]>(`/api/produtos${params}`)
      return data
    },
    enabled: nome !== undefined && nome.length >= 1,
  })
}

export function useBuscarPorCodigoBarras(codigo: string | null) {
  return useQuery<ProdutoResponse>({
    queryKey: ['produto-barcode', codigo],
    queryFn: async () => {
      const { data } = await api.get<ProdutoResponse>(`/api/produtos/codigo-barras/${codigo}`)
      return data
    },
    enabled: !!codigo && codigo.length >= 3,
    retry: false,
  })
}
