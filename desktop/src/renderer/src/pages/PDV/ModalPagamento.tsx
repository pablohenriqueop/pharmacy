import { useState, useEffect } from 'react'
import { Banknote, CreditCard, Smartphone } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { InputMoeda } from '@/components/ui/InputMoeda'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { cn, formatarMoeda } from '@/lib/utils'
import type { FormaPagamento } from '@shared/venda'

interface ModalPagamentoProps {
  aberto: boolean
  onFechar: () => void
  onConfirmar: (forma: FormaPagamento, valorPago?: number) => void
  carregando: boolean
}

const formasPagamento: { valor: FormaPagamento; label: string; icon: typeof Banknote; atalho: string }[] = [
  { valor: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, atalho: '1' },
  { valor: 'CARTAO_DEBITO', label: 'Cartão Débito', icon: CreditCard, atalho: '2' },
  { valor: 'CARTAO_CREDITO', label: 'Cartão Crédito', icon: CreditCard, atalho: '3' },
  { valor: 'PIX', label: 'PIX', icon: Smartphone, atalho: '4' },
]

export function ModalPagamento({ aberto, onFechar, onConfirmar, carregando }: ModalPagamentoProps) {
  const [formaSelecionada, setFormaSelecionada] = useState<FormaPagamento>('DINHEIRO')
  const [valorPago, setValorPago] = useState(0)
  const totalLiquido = useCarrinhoStore((s) => s.totalLiquido)

  const total = totalLiquido()
  const troco = formaSelecionada === 'DINHEIRO' ? Math.max(0, valorPago - total) : 0
  const podeConfirmar = formaSelecionada !== 'DINHEIRO' || valorPago >= total

  useEffect(() => {
    if (aberto) {
      setFormaSelecionada('DINHEIRO')
      setValorPago(0)
    }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return

    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onFechar()
        return
      }

      const forma = formasPagamento.find((f) => f.atalho === e.key)
      if (forma && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        setFormaSelecionada(forma.valor)
        return
      }

      if (e.key === 'Enter' && podeConfirmar && !carregando) {
        if (e.target instanceof HTMLInputElement) return
        e.preventDefault()
        onConfirmar(
          formaSelecionada,
          formaSelecionada === 'DINHEIRO' ? valorPago : undefined,
        )
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [aberto, formaSelecionada, valorPago, podeConfirmar, carregando, onFechar, onConfirmar])

  function handleConfirmarClick() {
    onConfirmar(
      formaSelecionada,
      formaSelecionada === 'DINHEIRO' ? valorPago : undefined,
    )
  }

  function handleValorKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && podeConfirmar && !carregando) {
      e.preventDefault()
      onConfirmar(formaSelecionada, valorPago)
    }
  }

  return (
    <Modal.Root aberto={aberto} onFechar={onFechar}>
      <Modal.Overlay />
      <Modal.Content className="max-w-lg">
        <Modal.Header>
          <Modal.Title>Finalizar Venda</Modal.Title>
          <Modal.Close />
        </Modal.Header>

        <Modal.Body>
          {/* Total */}
          <div className="text-center mb-6 py-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total a pagar</p>
            <p className="text-5xl font-black text-primary tabular-nums leading-none">
              {formatarMoeda(total)}
            </p>
          </div>

          {/* Formas de pagamento */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {formasPagamento.map(({ valor, label, icon: Icon, atalho }) => (
              <button
                key={valor}
                onClick={() => setFormaSelecionada(valor)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left',
                  formaSelecionada === valor
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-muted-foreground/30',
                )}
              >
                <Icon size={22} />
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">Tecla {atalho}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Valor recebido (dinheiro) */}
          {formaSelecionada === 'DINHEIRO' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">
                  Valor recebido
                </label>
                <InputMoeda
                  value={valorPago}
                  onChange={setValorPago}
                  onKeyDown={handleValorKeyDown}
                  autoFocus
                />
              </div>
              {valorPago > 0 && (
                <div className={cn(
                  'flex justify-between items-center px-5 py-4 rounded-xl',
                  troco > 0 ? 'bg-success/10' : 'bg-error/10',
                )}>
                  <span className={cn('font-semibold text-lg', troco > 0 ? 'text-success' : 'text-error')}>
                    Troco
                  </span>
                  <span className={cn('text-3xl font-black tabular-nums', troco > 0 ? 'text-success' : 'text-error')}>
                    {formatarMoeda(troco)}
                  </span>
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={onFechar}
            className="flex-1 h-14 rounded-xl border border-border font-semibold hover:bg-muted transition-colors text-base"
          >
            Cancelar (Esc)
          </button>
          <button
            onClick={handleConfirmarClick}
            disabled={!podeConfirmar || carregando}
            className={cn(
              'flex-1 h-14 rounded-xl text-lg font-bold transition-all',
              podeConfirmar && !carregando
                ? 'bg-success text-white hover:bg-success/90 shadow-md hover:shadow-lg'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {carregando ? 'Processando...' : 'Confirmar (Enter)'}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
