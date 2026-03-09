import { useState, useEffect, useRef } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Modal } from './Modal'
import { cn } from '@/lib/utils'

interface ModalPinProps {
  aberto: boolean
  titulo?: string
  mensagem?: string
  onConfirmar: (pin: string) => void
  onCancelar: () => void
  erro?: string
  carregando?: boolean
}

const PIN_LENGTH = 6

export function ModalPin({
  aberto,
  titulo = 'Confirmação de Segurança',
  mensagem = 'Digite seu PIN para confirmar esta ação.',
  onConfirmar,
  onCancelar,
  erro,
  carregando = false,
}: ModalPinProps) {
  const [pin, setPin] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (aberto) {
      setPin('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [aberto])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && pin.length >= PIN_LENGTH && !carregando) {
      e.preventDefault()
      onConfirmar(pin)
    }
  }

  return (
    <Modal.Root aberto={aberto} onFechar={onCancelar}>
      <Modal.Overlay />
      <Modal.Content className="max-w-sm">
        <Modal.Body className="text-center">
          <div className="flex justify-center mb-5">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={32} />
            </div>
          </div>

          <Modal.Title className="text-center mb-2">{titulo}</Modal.Title>
          <Modal.Message>{mensagem}</Modal.Message>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            maxLength={12}
            placeholder="Digite seu PIN"
            autoComplete="off"
            className={cn(
              'w-full h-14 px-4 rounded-xl border bg-white text-center text-2xl font-bold tracking-[0.5em] transition-colors mt-6 mb-4',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              erro ? 'border-error' : 'border-border',
            )}
          />

          {erro && (
            <div className="bg-error/10 text-error text-sm font-medium rounded-lg px-4 py-2.5 text-center mb-4">
              {erro}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-2">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  i < pin.length ? 'bg-primary' : 'bg-border',
                )}
              />
            ))}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={onCancelar}
            disabled={carregando}
            className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => pin.length >= PIN_LENGTH && onConfirmar(pin)}
            disabled={pin.length < PIN_LENGTH || carregando}
            className={cn(
              'flex-1 h-12 rounded-xl font-semibold text-white transition-all',
              pin.length >= PIN_LENGTH && !carregando
                ? 'bg-primary hover:bg-primary/90 shadow-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {carregando ? 'Verificando...' : 'Confirmar (Enter)'}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
