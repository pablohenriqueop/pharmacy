import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const APP_VERSION = __APP_VERSION__

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [erro, setErro] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginForm) {
    setErro('')
    try {
      await login.mutateAsync(data)
      navigate('/', { replace: true })
    } catch {
      setErro('E-mail ou senha incorretos')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-secondary">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          {/* Logo / Marca */}
          <div className="flex flex-col items-center mb-8">
            <Logo size="lg" />
            <p className="text-muted-foreground mt-2">Sistema de Gestão para Farmácia</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="seu@email.com"
                className={cn(
                  'w-full h-12 px-4 rounded-lg border bg-white text-base transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  errors.email ? 'border-error' : 'border-border',
                )}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    'w-full h-12 px-4 pr-12 rounded-lg border bg-white text-base transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    errors.password ? 'border-error' : 'border-border',
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-error mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Erro de login */}
            {erro && (
              <div className="bg-error/10 text-error text-sm font-medium rounded-lg px-4 py-3 text-center">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full h-12 rounded-lg text-base font-semibold transition-all flex items-center justify-center gap-2',
                isSubmitting
                  ? 'bg-primary/60 text-white cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.99] shadow-md hover:shadow-lg',
              )}
            >
              {isSubmitting ? (
                'Entrando...'
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Versão */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          PHarmacy v{APP_VERSION}
        </p>
      </div>
    </div>
  )
}
