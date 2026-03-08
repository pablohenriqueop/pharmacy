import type { Configuracao, AtualizarConfiguracaoInput } from '@/domain/entities/Configuracao.ts'

export interface IConfiguracaoRepository {
  buscarPorTenantId(tenantId: string): Promise<Configuracao | null>
  criarOuAtualizar(input: AtualizarConfiguracaoInput): Promise<Configuracao>
}
