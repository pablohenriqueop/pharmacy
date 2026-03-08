import type { IFluxoCaixaRepository } from '@/application/repositories/IFluxoCaixaRepository.ts'
import type { FluxoCaixaItem } from '@/domain/entities/Conta.ts'
import type { FiltroRelatorio } from '@/domain/entities/Relatorio.ts'
import type { Venda } from '@/domain/entities/Venda.ts'
import type { Conta } from '@/domain/entities/Conta.ts'

export class InMemoryFluxoCaixaRepository implements IFluxoCaixaRepository {
  constructor(
    public vendas: Venda[] = [],
    public contas: Conta[] = [],
  ) {}

  async fluxoPorPeriodo(tenantId: string, filtro: FiltroRelatorio): Promise<FluxoCaixaItem[]> {
    const porData = new Map<string, FluxoCaixaItem>()

    // Entradas: vendas concluídas
    const vendasFiltradas = this.vendas.filter(v =>
      v.tenantId === tenantId &&
      v.status === 'CONCLUIDA' &&
      v.props.createdAt >= filtro.dataInicio &&
      v.props.createdAt <= filtro.dataFim
    )

    for (const v of vendasFiltradas) {
      const data = v.props.createdAt.toISOString().split('T')[0]!
      const item = porData.get(data) ?? { data, entradas: 0, saidas: 0, saldo: 0 }
      item.entradas += v.total
      porData.set(data, item)
    }

    // Entradas extras: contas a receber pagas
    const recebimentos = this.contas.filter(c =>
      c.tenantId === tenantId &&
      c.status === 'PAGA' &&
      c.tipo === 'RECEBER' &&
      c.dataPagamento &&
      c.dataPagamento >= filtro.dataInicio &&
      c.dataPagamento <= filtro.dataFim
    )

    for (const c of recebimentos) {
      const data = c.dataPagamento!.toISOString().split('T')[0]!
      const item = porData.get(data) ?? { data, entradas: 0, saidas: 0, saldo: 0 }
      item.entradas += c.valor
      porData.set(data, item)
    }

    // Saídas: contas a pagar pagas
    const saidas = this.contas.filter(c =>
      c.tenantId === tenantId &&
      c.status === 'PAGA' &&
      c.tipo === 'PAGAR' &&
      c.dataPagamento &&
      c.dataPagamento >= filtro.dataInicio &&
      c.dataPagamento <= filtro.dataFim
    )

    for (const c of saidas) {
      const data = c.dataPagamento!.toISOString().split('T')[0]!
      const item = porData.get(data) ?? { data, entradas: 0, saidas: 0, saldo: 0 }
      item.saidas += c.valor
      porData.set(data, item)
    }

    const resultado = Array.from(porData.values()).sort((a, b) => a.data.localeCompare(b.data))
    for (const item of resultado) {
      item.saldo = item.entradas - item.saidas
    }

    return resultado
  }
}
