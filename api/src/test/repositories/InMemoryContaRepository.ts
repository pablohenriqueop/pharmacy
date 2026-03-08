import { Conta } from '@/domain/entities/Conta.ts'
import type { CriarContaInput } from '@/domain/entities/Conta.ts'
import type { IContaRepository, FiltroContas } from '@/application/repositories/IContaRepository.ts'

export class InMemoryContaRepository implements IContaRepository {
  public items: Conta[] = []

  async criar(input: CriarContaInput): Promise<Conta> {
    const conta = new Conta({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      tipo: input.tipo,
      descricao: input.descricao,
      valor: input.valor,
      categoria: input.categoria ?? null,
      dataVencimento: input.dataVencimento,
      dataPagamento: null,
      status: 'PENDENTE',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    this.items.push(conta)
    return conta
  }

  async buscarPorId(tenantId: string, id: string): Promise<Conta | null> {
    return this.items.find(c => c.tenantId === tenantId && c.id === id) ?? null
  }

  async listar(tenantId: string, filtros?: FiltroContas): Promise<Conta[]> {
    let resultado = this.items.filter(c => c.tenantId === tenantId)

    if (filtros?.tipo) {
      resultado = resultado.filter(c => c.tipo === filtros.tipo)
    }
    if (filtros?.status) {
      resultado = resultado.filter(c => c.status === filtros.status)
    }
    if (filtros?.dataInicio && filtros?.dataFim) {
      resultado = resultado.filter(c =>
        c.dataVencimento >= filtros.dataInicio! && c.dataVencimento <= filtros.dataFim!
      )
    }

    return resultado.sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime())
  }

  async pagar(tenantId: string, id: string): Promise<Conta | null> {
    const index = this.items.findIndex(c => c.tenantId === tenantId && c.id === id)
    if (index === -1) return null

    const atual = this.items[index]!
    const paga = new Conta({
      ...atual.props,
      status: 'PAGA',
      dataPagamento: new Date(),
      updatedAt: new Date(),
    })

    this.items[index] = paga
    return paga
  }

  async cancelar(tenantId: string, id: string): Promise<Conta | null> {
    const index = this.items.findIndex(c => c.tenantId === tenantId && c.id === id)
    if (index === -1) return null

    const atual = this.items[index]!
    const cancelada = new Conta({
      ...atual.props,
      status: 'CANCELADA',
      updatedAt: new Date(),
    })

    this.items[index] = cancelada
    return cancelada
  }
}
