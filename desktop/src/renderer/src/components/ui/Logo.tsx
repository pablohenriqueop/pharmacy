import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

const sizes = {
  sm: { icon: 28, text: 'text-lg' },
  md: { icon: 36, text: 'text-xl' },
  lg: { icon: 48, text: 'text-3xl' },
}

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cápsula arredondada */}
        <rect x="4" y="4" width="40" height="40" rx="12" fill="var(--color-primary)" />

        {/* Cruz da farmácia (PH estilizado) */}
        <rect x="20" y="12" width="8" height="24" rx="2" fill="white" />
        <rect x="12" y="20" width="24" height="8" rx="2" fill="white" />

        {/* Ponto no canto — diferencial da marca */}
        <circle cx="37" cy="11" r="3.5" fill="white" opacity="0.7" />
      </svg>

      {showText && (
        <span className={cn('font-bold tracking-tight', s.text)}>
          <span className="text-primary">PH</span>
          <span className="text-foreground">armacy</span>
        </span>
      )}
    </div>
  )
}
