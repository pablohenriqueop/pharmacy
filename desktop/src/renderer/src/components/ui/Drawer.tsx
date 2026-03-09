import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: React.ReactNode
  largura?: string
}

export function Drawer({ aberto, onFechar, titulo, children, largura = 'max-w-lg' }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return

    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onFechar()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  // Focus trap: quando abre, foca no drawer
  useEffect(() => {
    if (aberto) {
      setTimeout(() => {
        const firstInput = drawerRef.current?.querySelector<HTMLElement>('input, select, textarea')
        firstInput?.focus()
      }, 100)
    }
  }, [aberto])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-300',
          aberto ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onFechar}
      />

      {/* Painel */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full bg-white shadow-2xl border-l border-border flex flex-col transition-transform duration-300',
          largura,
          aberto ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            onClick={onFechar}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            title="Fechar (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </>
  )
}
