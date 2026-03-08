export type TipoConta = 'PAGAR' | 'RECEBER'
export type StatusConta = 'PENDENTE' | 'PAGA' | 'CANCELADA'

export interface ContaResponse {
  id: string
  tenantId: string
  tipo: TipoConta
  descricao: string
  valor: number
  categoria: string | null
  dataVencimento: string
  dataPagamento: string | null
  status: StatusConta
  createdAt: string
  updatedAt: string
}

export interface CriarContaRequest {
  tipo: TipoConta
  descricao: string
  valor: number
  categoria?: string
  dataVencimento: string
}

export interface FluxoCaixaItemResponse {
  data: string
  entradas: number
  saidas: number
  saldo: number
}
