import type { Venda } from '@/domain/entities/Venda.ts'
import type { INfceService, NfceEmissaoResult, NfceCancelamentoResult } from '@/application/services/INfceService.ts'

export class StubNfceService implements INfceService {
  private sequencial = 0

  async emitir(venda: Venda): Promise<NfceEmissaoResult> {
    this.sequencial++

    const chave = `35${Date.now()}${String(this.sequencial).padStart(9, '0')}`.padEnd(44, '0')

    return {
      chave,
      numero: this.sequencial,
      serie: 1,
      xml: `<nfeProc><NFe><infNFe Id="NFe${chave}"><total><vNF>${venda.total}</vNF></total></infNFe></NFe></nfeProc>`,
      protocolo: `135${Date.now()}`,
      status: 'AUTORIZADA',
    }
  }

  async cancelar(chave: string, _motivo: string): Promise<NfceCancelamentoResult> {
    return {
      protocolo: `235${Date.now()}`,
      status: 'CANCELADA',
    }
  }
}
