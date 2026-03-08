import { Nfce } from '@/domain/entities/Nfce.ts'
import type { NfceStatus } from '@/domain/entities/Nfce.ts'
import type { INfceRepository, CriarNfceInput } from '@/application/repositories/INfceRepository.ts'

export class InMemoryNfceRepository implements INfceRepository {
  public items: Nfce[] = []

  async criar(input: CriarNfceInput): Promise<Nfce> {
    const nfce = new Nfce({
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      vendaId: input.vendaId,
      chave: input.chave,
      numero: input.numero,
      serie: input.serie,
      xml: input.xml,
      protocolo: input.protocolo,
      status: input.status as NfceStatus,
      motivoCancelamento: null,
      createdAt: new Date(),
    })

    this.items.push(nfce)
    return nfce
  }

  async buscarPorId(tenantId: string, id: string): Promise<Nfce | null> {
    return this.items.find(n => n.tenantId === tenantId && n.id === id) ?? null
  }

  async buscarPorVendaId(tenantId: string, vendaId: string): Promise<Nfce | null> {
    return this.items.find(n => n.tenantId === tenantId && n.vendaId === vendaId) ?? null
  }

  async cancelar(tenantId: string, id: string, motivoCancelamento: string): Promise<Nfce | null> {
    const index = this.items.findIndex(n => n.tenantId === tenantId && n.id === id)
    if (index === -1) return null

    const atual = this.items[index]!
    const cancelada = new Nfce({
      ...atual.props,
      status: 'CANCELADA',
      motivoCancelamento,
    })

    this.items[index] = cancelada
    return cancelada
  }
}
