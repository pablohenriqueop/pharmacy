import { cn } from '@/lib/utils'

interface BadgeProps {
  variante: 'success' | 'error' | 'warning' | 'muted'
  children: React.ReactNode
  className?: string
}

const estilos = {
  success: 'bg-success/10 text-success border-success/20',
  error: 'bg-error/10 text-error border-error/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  muted: 'bg-muted text-muted-foreground border-border',
}

export function Badge({ variante, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      estilos[variante],
      className,
    )}>
      {children}
    </span>
  )
}
