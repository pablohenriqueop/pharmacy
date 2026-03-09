import { usePost } from '@/hooks/useApi'
import type { AbrirCaixaRequest, CaixaResponse } from '@shared/caixa'

export function useAbrirCaixa() {
  return usePost<AbrirCaixaRequest, CaixaResponse>('/api/caixas/abrir', [['caixa-aberto']])
}
