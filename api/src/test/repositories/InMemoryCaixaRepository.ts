import { Caixa } from '@/domain/entities/Caixa.ts'
import type { AbrirCaixaInput } from '@/domain/entities/Caixa.ts'
import type { ICaixaRepository } from '@/application/repositories/ICaixaRepository.ts'

export class InMemoryCaixaRepository implements ICaixaRepository {
  public items: Caixa[] = []

  async abrir(input: AbrirCaixaInput): Promise<Caixa> {
    const caixa = new Caixa({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      valorAbertura: input.valorAbertura,
      valorFechamento: null,
      aberturaEm: new Date(),
      fechamentoEm: null,
      status: 'ABERTO',
    })

    this.items.push(caixa)
    return caixa
  }

  async buscarPorId(tenantId: string, id: string): Promise<Caixa | null> {
    return this.items.find(c => c.tenantId === tenantId && c.id === id) ?? null
  }

  async buscarAberto(tenantId: string): Promise<Caixa | null> {
    return this.items.find(c => c.tenantId === tenantId && c.status === 'ABERTO') ?? null
  }

  async fechar(tenantId: string, id: string, valorFechamento: number): Promise<Caixa | null> {
    const index = this.items.findIndex(c => c.tenantId === tenantId && c.id === id)
    if (index === -1) return null

    const atual = this.items[index]!
    const fechado = new Caixa({
      ...atual.props,
      valorFechamento,
      fechamentoEm: new Date(),
      status: 'FECHADO',
    })

    this.items[index] = fechado
    return fechado
  }
}
