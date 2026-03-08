import type { Venda } from '@/domain/entities/Venda.ts'

export interface NfceEmissaoResult {
  chave: string
  numero: number
  serie: number
  xml: string
  protocolo: string
  status: 'AUTORIZADA' | 'REJEITADA'
  motivo?: string
}

export interface NfceCancelamentoResult {
  protocolo: string
  status: 'CANCELADA'
}

export interface INfceService {
  emitir(venda: Venda): Promise<NfceEmissaoResult>
  cancelar(chave: string, motivo: string): Promise<NfceCancelamentoResult>
}
