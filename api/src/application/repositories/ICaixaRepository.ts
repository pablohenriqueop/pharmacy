import type { Caixa, AbrirCaixaInput } from '@/domain/entities/Caixa.ts'

export interface ICaixaRepository {
  abrir(input: AbrirCaixaInput): Promise<Caixa>
  buscarPorId(tenantId: string, id: string): Promise<Caixa | null>
  buscarAberto(tenantId: string): Promise<Caixa | null>
  fechar(tenantId: string, id: string, valorFechamento: number): Promise<Caixa | null>
}
