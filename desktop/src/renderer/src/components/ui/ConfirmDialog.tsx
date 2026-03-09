import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  aberto: boolean
  titulo: string
  mensagem: string
  textoBotao?: string
  variante?: 'danger' | 'warning'
  carregando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoBotao = 'Confirmar',
  variante = 'danger',
  carregando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal.Root aberto={aberto} onFechar={onCancelar}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Body>
          <div className="flex items-start gap-4 mb-6">
            <div className={cn(
              'p-3 rounded-xl',
              variante === 'danger' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning',
            )}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <Modal.Title>{titulo}</Modal.Title>
              <p className="text-muted-foreground mt-1">{mensagem}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-end">
          <button
            onClick={onCancelar}
            disabled={carregando}
            className="px-5 py-2.5 rounded-xl border border-border text-base font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={carregando}
            className={cn(
              'px-5 py-2.5 rounded-xl text-white text-base font-medium transition-colors',
              variante === 'danger'
                ? 'bg-error hover:bg-error/90'
                : 'bg-warning hover:bg-warning/90',
              carregando && 'opacity-60 cursor-not-allowed',
            )}
          >
            {carregando ? 'Processando...' : textoBotao}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
