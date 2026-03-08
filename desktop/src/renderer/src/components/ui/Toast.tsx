import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { cn } from '@/lib/utils'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-error/10 border-error/30 text-error',
  info: 'bg-primary/10 border-primary/30 text-primary',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg min-w-80',
              'animate-in slide-in-from-right-5 fade-in duration-300',
              styles[toast.type],
            )}
          >
            <Icon size={20} className="shrink-0" />
            <p className="flex-1 font-medium text-base">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
