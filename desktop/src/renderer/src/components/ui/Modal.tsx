import { createContext, useContext, useEffect, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Context ────────────────────────────────────────────────────

interface ModalContextValue {
  onFechar?: () => void
}

const ModalContext = createContext<ModalContextValue>({})

function useModal() {
  return useContext(ModalContext)
}

// ─── Root ───────────────────────────────────────────────────────

interface RootProps {
  aberto: boolean
  onFechar?: () => void
  children: React.ReactNode
}

function Root({ aberto, onFechar, children }: RootProps) {
  useEffect(() => {
    if (!aberto || !onFechar) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onFechar!()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <ModalContext.Provider value={{ onFechar }}>
      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        {children}
      </div>
    </ModalContext.Provider>
  )
}

// ─── Overlay ────────────────────────────────────────────────────

function Overlay({ className }: { className?: string }) {
  const { onFechar } = useModal()

  return (
    <div
      className={cn('fixed inset-0 bg-black/30 backdrop-blur-sm', className)}
      onClick={onFechar}
    />
  )
}

// ─── Content ────────────────────────────────────────────────────

interface ContentProps {
  children: React.ReactNode
  className?: string
}

function Content({ children, className }: ContentProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => {
      const btn = ref.current?.querySelector<HTMLElement>('button, input')
      btn?.focus()
    }, 50)
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'relative bg-white rounded-2xl shadow-lg w-full max-w-md p-8',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── Header ─────────────────────────────────────────────────────

function Header({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      {children}
    </div>
  )
}

// ─── Title ──────────────────────────────────────────────────────

function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-xl font-bold', className)}>{children}</h2>
}

// ─── Close ──────────────────────────────────────────────────────

function Close({ className }: { className?: string }) {
  const { onFechar } = useModal()
  if (!onFechar) return null

  return (
    <button
      onClick={onFechar}
      className={cn(
        'p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors',
        className,
      )}
    >
      <X size={20} />
    </button>
  )
}

// ─── Body ───────────────────────────────────────────────────────

function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>
}

// ─── Footer ─────────────────────────────────────────────────────

function Footer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex gap-3 mt-6', className)}>{children}</div>
}

// ─── Icon ───────────────────────────────────────────────────────

type Variante = 'success' | 'error' | 'info'

const icones = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const coresIcone = {
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  info: 'bg-primary/10 text-primary',
}

function Icon({ variante, className }: { variante: Variante; className?: string }) {
  const Icone = icones[variante]
  return (
    <div className={cn('flex justify-center mb-4', className)}>
      <div className={cn('p-4 rounded-2xl', coresIcone[variante])}>
        <Icone size={32} />
      </div>
    </div>
  )
}

// ─── Message ────────────────────────────────────────────────────

function Message({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-muted-foreground text-center text-base', className)}>
      {children}
    </p>
  )
}

// ─── Export ──────────────────────────────────────────────────────

export const Modal = {
  Root,
  Overlay,
  Content,
  Header,
  Title,
  Close,
  Body,
  Footer,
  Icon,
  Message,
}
