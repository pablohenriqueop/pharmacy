import { useState } from 'react'
import {
  Landmark,
  DollarSign,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useCaixaAberto, useFecharCaixa } from '@/hooks/useCaixa'
import { useListarVendas } from '@/hooks/useVendas'
import { ModalAbrirCaixa } from '@/components/ModalAbrirCaixa'
import { Modal } from '@/components/ui/Modal'
import { InputMoeda } from '@/components/ui/InputMoeda'
import { Badge } from '@/components/ui/Badge'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { cn, formatarMoeda } from '@/lib/utils'
import type { VendaResponse, FormaPagamento } from '@shared/venda'

const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  CARTAO_DEBITO: 'Cartão Débito',
  CARTAO_CREDITO: 'Cartão Crédito',
  PIX: 'PIX',
}

const FORMA_PAGAMENTO_ICON: Record<FormaPagamento, typeof DollarSign> = {
  DINHEIRO: Banknote,
  CARTAO_DEBITO: CreditCard,
  CARTAO_CREDITO: CreditCard,
  PIX: QrCode,
}

const POR_PAGINA = 15

export function Caixa() {
  const feedback = useFeedbackStore((s) => s.show)
  const { data: caixa, isLoading: loadingCaixa } = useCaixaAberto()
  const fecharCaixa = useFecharCaixa()

  const [modalAbrir, setModalAbrir] = useState(false)
  const [modalFechar, setModalFechar] = useState(false)
  const [valorFechamento, setValorFechamento] = useState(0)
  const [pagina, setPagina] = useState(1)

  const { data: vendasData } = useListarVendas(caixa?.id, pagina, POR_PAGINA)

  const vendas = vendasData?.dados ?? []
  const totalPaginas = vendasData?.totalPaginas ?? 1
  const totalVendas = vendasData?.total ?? 0

  // Resumo por forma de pagamento
  const resumo = vendas.reduce(
    (acc, v) => {
      if (v.status === 'CANCELADA') return acc
      acc[v.formaPagamento] = (acc[v.formaPagamento] || 0) + Number(v.total)
      acc._total += Number(v.total)
      acc._qtd += 1
      return acc
    },
    { _total: 0, _qtd: 0 } as Record<string, number>,
  )

  async function handleFechar() {
    if (!caixa) return
    try {
      await fecharCaixa.mutateAsync({ id: caixa.id, valorFechamento })
      feedback('success', 'Caixa fechado com sucesso!')
      setModalFechar(false)
      setValorFechamento(0)
    } catch {
      feedback('error', 'Erro ao fechar caixa.')
    }
  }

  if (loadingCaixa) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Caixa não aberto
  if (!caixa) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="p-6 rounded-2xl bg-primary/10">
          <Landmark size={48} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Nenhum caixa aberto</h2>
          <p className="text-muted-foreground text-lg">
            Abra o caixa para começar a registrar vendas.
          </p>
        </div>
        <button
          onClick={() => setModalAbrir(true)}
          className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-lg shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
        >
          Abrir Caixa
        </button>
        <ModalAbrirCaixa aberto={modalAbrir} onFechar={() => setModalAbrir(false)} onAbriu={() => setModalAbrir(false)} />
      </div>
    )
  }

  const horaAbertura = new Date(caixa.aberturaEm).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Landmark size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">Caixa</h2>
          <Badge variante="success">Aberto</Badge>
        </div>

        <button
          onClick={() => {
            setValorFechamento(0)
            setModalFechar(true)
          }}
          className="px-5 py-2.5 bg-error text-white rounded-xl font-bold shadow-md hover:bg-error/90 hover:shadow-lg transition-all"
        >
          Fechar Caixa
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-4 gap-3">
        <CardResumo
          label="Abertura"
          valor={formatarMoeda(caixa.valorAbertura)}
          icone={<DollarSign size={18} />}
          cor="primary"
        />
        <CardResumo
          label="Aberto desde"
          valor={horaAbertura}
          icone={<Clock size={18} />}
          cor="primary"
        />
        <CardResumo
          label="Vendas (página)"
          valor={String(resumo._qtd)}
          icone={<Landmark size={18} />}
          cor="success"
        />
        <CardResumo
          label="Total (página)"
          valor={formatarMoeda(resumo._total)}
          icone={<DollarSign size={18} />}
          cor="success"
        />
      </div>

      {/* Resumo por forma de pagamento */}
      <div className="grid grid-cols-4 gap-3">
        {(['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX'] as FormaPagamento[]).map((fp) => {
          const Icon = FORMA_PAGAMENTO_ICON[fp]
          return (
            <div
              key={fp}
              className="bg-white rounded-xl border border-border shadow-sm px-4 py-3 flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-muted">
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{FORMA_PAGAMENTO_LABEL[fp]}</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatarMoeda(resumo[fp] || 0)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lista de vendas */}
      <div className="flex-1 bg-white rounded-xl border border-border shadow-md overflow-hidden flex flex-col">
        <div className="px-5 py-2.5 border-b border-border bg-muted/30">
          <p className="text-sm font-semibold text-muted-foreground">
            Vendas do caixa · {totalVendas} registros
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          {vendas.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <p className="text-lg">Nenhuma venda registrada neste caixa</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-sm text-muted-foreground border-b border-border">
                  <th className="py-2.5 px-4 font-semibold text-left">Horário</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Itens</th>
                  <th className="py-2.5 px-4 font-semibold text-left">Pagamento</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda, index) => (
                  <LinhaVenda key={venda.id} venda={venda} index={index} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
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

      {/* Modal fechar caixa */}
      <Modal.Root aberto={modalFechar} onFechar={() => setModalFechar(false)}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Body>
            <Modal.Title className="mb-2">Fechar Caixa</Modal.Title>
            <p className="text-muted-foreground mb-6">
              Informe o valor total em caixa para conferência.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Valor de fechamento</label>
              <InputMoeda
                value={valorFechamento}
                onChange={setValorFechamento}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFechar()
                }}
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <button
              onClick={() => setModalFechar(false)}
              className="flex-1 h-12 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleFechar}
              disabled={fecharCaixa.isPending}
              className={cn(
                'flex-1 h-12 rounded-xl font-bold text-white transition-all',
                fecharCaixa.isPending
                  ? 'bg-error/60 cursor-not-allowed'
                  : 'bg-error hover:bg-error/90 shadow-md',
              )}
            >
              {fecharCaixa.isPending ? 'Fechando...' : 'Fechar Caixa (Enter)'}
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  )
}

// ─── Componentes internos ──────────────────────────────────────

function CardResumo({
  label,
  valor,
  icone,
  cor,
}: {
  label: string
  valor: string
  icone: React.ReactNode
  cor: 'primary' | 'success'
}) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm px-4 py-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn('p-1.5 rounded-lg', cor === 'primary' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success')}>
          {icone}
        </div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      <p className="text-lg font-bold tabular-nums">{valor}</p>
    </div>
  )
}

function LinhaVenda({ venda, index }: { venda: VendaResponse; index: number }) {
  const hora = new Date(venda.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-muted/50',
        index > 0 && 'border-t border-border/50',
      )}
    >
      <td className="py-2.5 px-4">{hora}</td>
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
    </tr>
  )
}
