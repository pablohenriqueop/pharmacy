import { useState, useRef, useEffect } from 'react'
import { X, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { cn } from '@/lib/utils'
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
  const [valorPago, setValorPago] = useState('')
  const totalLiquido = useCarrinhoStore((s) => s.totalLiquido)
  const inputRef = useRef<HTMLInputElement>(null)

  const total = totalLiquido()
  const valorPagoNum = parseFloat(valorPago) || 0
  const troco = formaSelecionada === 'DINHEIRO' ? Math.max(0, valorPagoNum - total) : 0
  const podeConfirmar = formaSelecionada !== 'DINHEIRO' || valorPagoNum >= total

  useEffect(() => {
    if (aberto) {
      setFormaSelecionada('DINHEIRO')
      setValorPago('')
      setTimeout(() => inputRef.current?.focus(), 100)
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
        if (forma.valor === 'DINHEIRO') {
          setTimeout(() => inputRef.current?.focus(), 50)
        }
        return
      }

      if (e.key === 'Enter' && podeConfirmar && !carregando) {
        e.preventDefault()
        onConfirmar(
          formaSelecionada,
          formaSelecionada === 'DINHEIRO' ? valorPagoNum : undefined,
        )
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [aberto, formaSelecionada, valorPagoNum, podeConfirmar, carregando, onFechar, onConfirmar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8 relative">
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Finalizar Venda</h2>

        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Total a pagar</p>
          <p className="text-4xl font-bold text-primary tabular-nums">
            R$ {total.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {formasPagamento.map(({ valor, label, icon: Icon, atalho }) => (
            <button
              key={valor}
              onClick={() => {
                setFormaSelecionada(valor)
                if (valor === 'DINHEIRO') setTimeout(() => inputRef.current?.focus(), 50)
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left',
                formaSelecionada === valor
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-muted-foreground/30',
              )}
            >
              <Icon size={20} />
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">Tecla {atalho}</p>
              </div>
            </button>
          ))}
        </div>

        {formaSelecionada === 'DINHEIRO' && (
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Valor recebido
              </label>
              <input
                ref={inputRef}
                type="number"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className={cn(
                  'w-full h-14 px-4 text-2xl font-semibold text-center tabular-nums',
                  'bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary/30',
                )}
              />
            </div>
            {valorPagoNum > 0 && (
              <div className={cn(
                'flex justify-between items-center px-4 py-3 rounded-xl',
                troco > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
              )}>
                <span className="font-medium">Troco</span>
                <span className="text-2xl font-bold tabular-nums">
                  R$ {troco.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() =>
            onConfirmar(
              formaSelecionada,
              formaSelecionada === 'DINHEIRO' ? valorPagoNum : undefined,
            )
          }
          disabled={!podeConfirmar || carregando}
          className={cn(
            'w-full h-14 rounded-xl text-lg font-semibold transition-all',
            podeConfirmar && !carregando
              ? 'bg-success text-white hover:bg-success/90 shadow-md hover:shadow-lg'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
        >
          {carregando ? 'Processando...' : 'Confirmar Pagamento (Enter)'}
        </button>
      </div>
    </div>
  )
}
