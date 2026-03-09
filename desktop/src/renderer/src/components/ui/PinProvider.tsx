import { ModalPin } from './ModalPin'
import { ModalDefinirPin } from './ModalDefinirPin'
import type { usePin } from '@/hooks/usePin'

interface PinModaisProps {
  modalState: ReturnType<typeof usePin>['modalState']
}

/**
 * Renderiza os modais de PIN (definir + verificar).
 * Usar junto com o hook usePin():
 *
 * ```tsx
 * const { solicitarPin, modalState } = usePin()
 * return <PinModais modalState={modalState} />
 * ```
 */
export function PinModais({ modalState }: PinModaisProps) {
  return (
    <>
      <ModalDefinirPin
        aberto={modalState.tipo === 'definir'}
        onConfirmar={modalState.onConfirmarDefinir}
        onCancelar={modalState.onCancelar}
        carregando={modalState.carregando}
      />
      <ModalPin
        aberto={modalState.tipo === 'verificar'}
        mensagem={modalState.mensagem}
        onConfirmar={modalState.onConfirmarVerificar}
        onCancelar={modalState.onCancelar}
        erro={modalState.erro}
        carregando={modalState.carregando}
      />
    </>
  )
}
