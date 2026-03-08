import type { Nfce } from '@/domain/entities/Nfce.ts'

export interface CriarNfceInput {
  tenantId: string
  vendaId: string
  chave: string
  numero: number
  serie: number
  xml: string
  protocolo: string
  status: string
}

export interface INfceRepository {
  criar(input: CriarNfceInput): Promise<Nfce>
  buscarPorId(tenantId: string, id: string): Promise<Nfce | null>
  buscarPorVendaId(tenantId: string, vendaId: string): Promise<Nfce | null>
  cancelar(tenantId: string, id: string, motivoCancelamento: string): Promise<Nfce | null>
}
