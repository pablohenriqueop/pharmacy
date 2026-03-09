import { useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface InputMoedaProps {
  value: number
  onChange: (valor: number) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
  id?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}

/**
 * Input de moeda brasileira (R$) com máscara automática.
 * Aceita apenas números. Formata como currency em tempo real.
 * Valor interno é em centavos → converte pra reais no onChange.
 */
export function InputMoeda({
  value,
  onChange,
  placeholder = '0,00',
  autoFocus = false,
  className,
  id,
  onKeyDown,
}: InputMoedaProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [autoFocus])

  const centavos = Math.round(value * 100)

  const formatado = (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite: Backspace, Delete, Tab, Escape, Enter, setas
      const permitidas = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight']
      if (permitidas.includes(e.key)) {
        if (e.key === 'Backspace') {
          e.preventDefault()
          const novoCentavos = Math.floor(centavos / 10)
          onChange(novoCentavos / 100)
        }
        onKeyDown?.(e)
        return
      }

      // Apenas dígitos
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
        return
      }

      e.preventDefault()
      const novoCentavos = centavos * 10 + parseInt(e.key)
      // Limite: R$ 999.999,99
      if (novoCentavos > 99999999) return
      onChange(novoCentavos / 100)
    },
    [centavos, onChange, onKeyDown],
  )

  const valorExibido = centavos === 0 ? '' : `R$ ${formatado}`

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      value={valorExibido}
      placeholder={`R$ ${placeholder}`}
      onKeyDown={handleKeyDown}
      onChange={() => {}} // controlado via onKeyDown
      className={cn(
        'w-full h-14 px-4 rounded-lg border border-border bg-white text-2xl font-semibold text-center tabular-nums transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
        className,
      )}
    />
  )
}
