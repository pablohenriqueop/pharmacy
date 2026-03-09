import { Modal } from './Modal'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { cn } from '@/lib/utils'

const titulos = {
  success: 'Sucesso',
  error: 'Erro',
  info: 'Informação',
}

const coresBotao = {
  success: 'bg-success hover:bg-success/90',
  error: 'bg-error hover:bg-error/90',
  info: 'bg-primary hover:bg-primary/90',
}

export function ModalFeedback() {
  const { aberto, tipo, mensagem, fechar } = useFeedbackStore()

  return (
    <Modal.Root aberto={aberto} onFechar={fechar}>
      <Modal.Overlay />
      <Modal.Content className="max-w-sm">
        <Modal.Body className="text-center">
          <Modal.Icon variante={tipo} />
          <Modal.Title className="text-center mb-2">{titulos[tipo]}</Modal.Title>
          <Modal.Message>{mensagem}</Modal.Message>
        </Modal.Body>
        <Modal.Footer className="justify-center">
          <button
            onClick={fechar}
            autoFocus
            className={cn(
              'px-8 h-12 rounded-xl font-semibold text-white transition-all shadow-md min-w-32',
              coresBotao[tipo],
            )}
          >
            OK
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
