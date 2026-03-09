import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { InputMoeda } from '@/components/ui/InputMoeda'
import { useAbrirCaixa } from '@/hooks/useAbrirCaixa'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { cn } from '@/lib/utils'

interface ModalAbrirCaixaProps {
  aberto: boolean
  onFechar: () => void
  onAbriu: () => void
}

export function ModalAbrirCaixa({ aberto, onFechar, onAbriu }: ModalAbrirCaixaProps) {
  const [valorAbertura, setValorAbertura] = useState(0)
  const abrirCaixa = useAbrirCaixa()
  const feedback = useFeedbackStore((s) => s.show)

  useEffect(() => {
    if (aberto) setValorAbertura(0)
  }, [aberto])

  async function handleAbrir() {
    try {
      await abrirCaixa.mutateAsync({ valorAbertura })
      feedback('success', 'Caixa aberto com sucesso!')
      onAbriu()
    } catch {
      feedback('error', 'Erro ao abrir caixa. Tente novamente.')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAbrir()
    }
  }

  return (
    <Modal.Root aberto={aberto} onFechar={onFechar}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign size={20} className="text-primary" />
            </div>
            <div>
              <Modal.Title>Abrir Caixa</Modal.Title>
              <p className="text-sm text-muted-foreground">
                Informe o valor inicial para começar
              </p>
            </div>
          </div>
          <Modal.Close />
        </Modal.Header>

        <Modal.Body>
          <div>
            <label htmlFor="valor-abertura" className="block text-sm font-semibold mb-2">
              Valor de abertura
            </label>
            <InputMoeda
              id="valor-abertura"
              value={valorAbertura}
              onChange={setValorAbertura}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <p className="text-sm text-muted-foreground mt-2">
              Pode ser R$ 0,00 se o caixa não tem troco inicial
            </p>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={onFechar}
            className="flex-1 h-12 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAbrir}
            disabled={abrirCaixa.isPending}
            className={cn(
              'flex-1 h-12 rounded-xl text-base font-bold transition-all',
              abrirCaixa.isPending
                ? 'bg-primary/60 text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.99] shadow-md hover:shadow-lg',
            )}
          >
            {abrirCaixa.isPending ? 'Abrindo...' : 'Abrir Caixa (Enter)'}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
