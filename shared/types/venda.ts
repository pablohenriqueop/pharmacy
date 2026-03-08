export type FormaPagamento = 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX'
export type VendaStatus = 'CONCLUIDA' | 'CANCELADA'

export interface ItemVendaResponse {
  id: string
  vendaId: string
  produtoId: string
  quantidade: number
  precoUnit: number
  subtotal: number
}

export interface VendaResponse {
  id: string
  tenantId: string
  caixaId: string
  total: number
  desconto: number
  formaPagamento: FormaPagamento
  valorPago: number | null
  troco: number | null
  status: VendaStatus
  nfceChave: string | null
  createdAt: string
  itens: ItemVendaResponse[]
}

export interface ItemVendaRequest {
  produtoId: string
  quantidade: number
  precoUnit: number
}

export interface CriarVendaRequest {
  caixaId: string
  formaPagamento: FormaPagamento
  desconto?: number
  valorPago?: number
  itens: ItemVendaRequest[]
}
