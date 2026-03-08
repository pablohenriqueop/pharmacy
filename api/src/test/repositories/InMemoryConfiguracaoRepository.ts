import { Configuracao } from '@/domain/entities/Configuracao.ts'
import type { AtualizarConfiguracaoInput } from '@/domain/entities/Configuracao.ts'
import type { IConfiguracaoRepository } from '@/application/repositories/IConfiguracaoRepository.ts'

export class InMemoryConfiguracaoRepository implements IConfiguracaoRepository {
  public items: Configuracao[] = []

  async buscarPorTenantId(tenantId: string): Promise<Configuracao | null> {
    return this.items.find(c => c.tenantId === tenantId) ?? null
  }

  async criarOuAtualizar(input: AtualizarConfiguracaoInput): Promise<Configuracao> {
    const index = this.items.findIndex(c => c.tenantId === input.tenantId)

    const config = new Configuracao({
      id: index >= 0 ? this.items[index]!.id : crypto.randomUUID(),
      tenantId: input.tenantId,
      nomeFarmacia: input.nomeFarmacia,
      corPrimaria: input.corPrimaria ?? (index >= 0 ? this.items[index]!.corPrimaria : '#0095DA'),
      corSecundaria: input.corSecundaria ?? (index >= 0 ? this.items[index]!.corSecundaria : '#FFFFFF'),
      logoUrl: input.logoUrl !== undefined ? input.logoUrl : (index >= 0 ? this.items[index]!.logoUrl : null),
      createdAt: index >= 0 ? this.items[index]!.createdAt : new Date(),
      updatedAt: new Date(),
    })

    if (index >= 0) {
      this.items[index] = config
    } else {
      this.items.push(config)
    }

    return config
  }
}
