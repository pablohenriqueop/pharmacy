import { useState, useCallback } from 'react'
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useCaixaAberto } from '@/hooks/useCaixa'
import { useListarVendas, useCancelarVenda } from '@/hooks/useVendas'
import { usePin } from '@/hooks/usePin'
import { PinModais } from '@/components/ui/PinProvider'
import { Badge } from '@/components/ui/Badge'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatarMoeda } from '@/lib/utils'
import type { VendaResponse, FormaPagamento } from '@shared/venda'

const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  CARTAO_DEBITO: 'Cartão Débito',
  CARTAO_CREDITO: 'Cartão Crédito',
  PIX: 'PIX',
}

const POR_PAGINA = 20

export function Vendas() {
  const role = useAuthStore((s) => s.user?.role)
  const podeCancelar = role === 'boss' || role === 'admin' || role === 'gerente'
  const feedback = useFeedbackStore((s) => s.show)
  const { solicitarPin, modalState: pinModalState } = usePin()

  const { data: caixa } = useCaixaAberto()
  const cancelarVenda = useCancelarVenda()

  const [pagina, setPagina] = useState(1)
  const [detalhe, setDetalhe] = useState<VendaResponse | null>(null)

  const { data, isLoading } = useListarVendas(caixa?.id, pagina, POR_PAGINA)

  const vendas = data?.dados ?? []
  const totalPaginas = data?.totalPaginas ?? 1
  const total = data?.total ?? 0

  const handleCancelar = useCallback(
    async (venda: VendaResponse) => {
      const pin = await solicitarPin(`Confirme para cancelar a venda.`)
      if (!pin) return

      try {
        await cancelarVenda.mutateAsync({ id: venda.id, pin })
        feedback('success', 'Venda cancelada com sucesso!')
        setDetalhe(null)
      } catch {
        feedback('error', 'Erro ao cancelar venda.')
      }
    },
    [solicitarPin, cancelarVenda, feedback],
  )

  if (!caixa) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <ShoppingBag size={48} className="text-muted-foreground/50" />
        <p className="text-lg text-muted-foreground">
          Abra o caixa para ver o histórico de vendas.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingBag size={24} className="text-primary" />
        <h2 className="text-2xl font-bold">Vendas</h2>
        {total > 0 && (
          <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-semibold">
            {total}
          </span>
        )}
      </div>

      {/* Tabela */}
      <div className="flex-1 bg-white rounded-xl border border-border shadow-md overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg text-muted-foreground">Carregando...</p>
          </div>
        ) : vendas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg text-muted-foreground">Nenhuma venda encontrada</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-muted-foreground border-b border-border">
                  <th className="py-2.5 px-4 font-semibold text-left">Horário</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Itens</th>
                  <th className="py-2.5 px-4 font-semibold text-left">Pagamento</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-center w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda, index) => (
                  <tr
                    key={venda.id}
                    className={cn(
                      'transition-colors hover:bg-muted/50 cursor-pointer',
                      index > 0 && 'border-t border-border/50',
                    )}
                    onClick={() => setDetalhe(venda)}
                  >
                    <td className="py-2.5 px-4">
                      {new Date(venda.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-4 text-center text-muted-foreground">
                      {venda.itens.length}
                    </td>
                    <td className="py-2.5 px-4">
                      {FORMA_PAGAMENTO_LABEL[venda.formaPagamento]}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold tabular-nums">
                      {formatarMoeda(venda.total)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {venda.status === 'CONCLUIDA' ? (
                        <Badge variante="success">Concluída</Badge>
                      ) : (
                        <Badge variante="error">Cancelada</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetalhe(venda)
                        }}
                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas} · {total} vendas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalhe da venda */}
      <Modal.Root aberto={!!detalhe} onFechar={() => setDetalhe(null)}>
        <Modal.Overlay />
        <Modal.Content className="max-w-lg">
          <Modal.Header>
            <Modal.Title>Detalhe da Venda</Modal.Title>
            <Modal.Close />
          </Modal.Header>

          {detalhe && (
            <Modal.Body>
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <InfoItem label="Horário">
                  {new Date(detalhe.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </InfoItem>
                <InfoItem label="Pagamento">
                  {FORMA_PAGAMENTO_LABEL[detalhe.formaPagamento]}
                </InfoItem>
                <InfoItem label="Status">
                  {detalhe.status === 'CONCLUIDA' ? (
                    <Badge variante="success">Concluída</Badge>
                  ) : (
                    <Badge variante="error">Cancelada</Badge>
                  )}
                </InfoItem>
                <InfoItem label="Total">
                  <span className="text-xl font-black text-primary">{formatarMoeda(detalhe.total)}</span>
                </InfoItem>
                {Number(detalhe.desconto) > 0 && (
                  <InfoItem label="Desconto">{formatarMoeda(detalhe.desconto)}</InfoItem>
                )}
                {detalhe.troco !== null && Number(detalhe.troco) > 0 && (
                  <InfoItem label="Troco">{formatarMoeda(detalhe.troco)}</InfoItem>
                )}
              </div>

              {/* Itens */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-muted/50 text-sm font-semibold text-muted-foreground border-b border-border">
                  Itens ({detalhe.itens.length})
                </div>
                <div className="max-h-48 overflow-auto">
                  {detalhe.itens.map((item, i) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5',
                        i > 0 && 'border-t border-border/50',
                      )}
                    >
                      <p className="text-sm">
                        {item.quantidade}x {formatarMoeda(item.precoUnit)}
                      </p>
                      <p className="text-sm font-bold tabular-nums">
                        {formatarMoeda(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Modal.Body>
          )}

          <Modal.Footer>
            <button
              onClick={() => setDetalhe(null)}
              className="flex-1 h-12 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
            >
              Fechar
            </button>
            {podeCancelar && detalhe?.status === 'CONCLUIDA' && (
              <button
                onClick={() => handleCancelar(detalhe)}
                disabled={cancelarVenda.isPending}
                className="flex items-center justify-center gap-2 flex-1 h-12 rounded-xl bg-error text-white font-bold hover:bg-error/90 transition-colors disabled:opacity-60"
              >
                <Ban size={16} />
                {cancelarVenda.isPending ? 'Cancelando...' : 'Cancelar Venda'}
              </button>
            )}
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      <PinModais modalState={pinModalState} />
    </div>
  )
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <div className="text-base">{children}</div>
    </div>
  )
}
