import { useState, useEffect, useRef } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Modal } from './Modal'
import { cn } from '@/lib/utils'

interface ModalDefinirPinProps {
  aberto: boolean
  onConfirmar: (pin: string) => void
  onCancelar: () => void
  carregando?: boolean
}

const PIN_LENGTH = 6

export function ModalDefinirPin({ aberto, onConfirmar, onCancelar, carregando = false }: ModalDefinirPinProps) {
  const [pin, setPin] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [etapa, setEtapa] = useState<'pin' | 'confirmar'>('pin')
  const [erro, setErro] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (aberto) {
      setPin('')
      setConfirmacao('')
      setEtapa('pin')
      setErro('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [aberto])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const valor = e.target.value.replace(/\D/g, '')
    setErro('')
    if (etapa === 'pin') {
      setPin(valor)
    } else {
      setConfirmacao(valor)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAvancar()
    }
  }

  function handleAvancar() {
    if (etapa === 'pin' && pin.length >= PIN_LENGTH) {
      setEtapa('confirmar')
      setTimeout(() => inputRef.current?.focus(), 50)
    } else if (etapa === 'confirmar' && confirmacao.length >= PIN_LENGTH) {
      if (confirmacao !== pin) {
        setErro('Os PINs não coincidem. Tente novamente.')
        setConfirmacao('')
        return
      }
      onConfirmar(pin)
    }
  }

  const valorAtual = etapa === 'pin' ? pin : confirmacao

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

          <Modal.Title className="text-center mb-2">Defina seu PIN</Modal.Title>
          <Modal.Message>
            {etapa === 'pin'
              ? `Crie um PIN numérico de no mínimo ${PIN_LENGTH} dígitos.`
              : 'Confirme seu PIN digitando novamente.'}
          </Modal.Message>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            value={valorAtual}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={12}
            placeholder={etapa === 'pin' ? 'Novo PIN' : 'Confirme o PIN'}
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

          {/* Indicador de dígitos */}
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  i < valorAtual.length ? 'bg-primary' : 'bg-border',
                )}
              />
            ))}
          </div>

          {/* Indicador de etapa */}
          <div className="flex justify-center gap-2 mb-2">
            <div className={cn('w-2 h-2 rounded-full', etapa === 'pin' ? 'bg-primary' : 'bg-border')} />
            <div className={cn('w-2 h-2 rounded-full', etapa === 'confirmar' ? 'bg-primary' : 'bg-border')} />
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
            onClick={handleAvancar}
            disabled={valorAtual.length < PIN_LENGTH || carregando}
            className={cn(
              'flex-1 h-12 rounded-xl font-semibold text-white transition-all',
              valorAtual.length >= PIN_LENGTH && !carregando
                ? 'bg-primary hover:bg-primary/90 shadow-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {carregando ? 'Salvando...' : etapa === 'pin' ? 'Continuar' : 'Definir PIN'}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
