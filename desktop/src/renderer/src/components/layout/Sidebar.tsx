import { NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  CreditCard,
  BarChart3,
  DollarSign,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { useCaixaAberto } from '@/hooks/useCaixa'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { useFeedbackStore } from '@/stores/feedbackStore'

const APP_VERSION = __APP_VERSION__

type Role = 'boss' | 'admin' | 'gerente' | 'operador'

const navItems = [
  { to: '/', icon: ShoppingCart, label: 'PDV', roles: ['boss', 'admin', 'gerente', 'operador'] as Role[] },
  { to: '/produtos', icon: Package, label: 'Produtos', roles: ['boss', 'admin', 'gerente'] as Role[] },
  { to: '/caixa', icon: CreditCard, label: 'Caixa', roles: ['boss', 'admin', 'gerente', 'operador'] as Role[] },
  { to: '/vendas', icon: FileText, label: 'Vendas', roles: ['boss', 'admin', 'gerente'] as Role[] },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios', roles: ['boss', 'admin', 'gerente'] as Role[] },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', roles: ['boss', 'admin', 'gerente'] as Role[] },
  { to: '/configuracoes', icon: Settings, label: 'Configurações', roles: ['boss', 'admin'] as Role[] },
]

interface SidebarProps {
  nomeFarmacia?: string
  logoUrl?: string | null
}

export function Sidebar({ nomeFarmacia, logoUrl }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { data: caixa } = useCaixaAberto()
  const itensCarrinho = useCarrinhoStore((s) => s.itens)
  const feedback = useFeedbackStore((s) => s.show)

  async function handleLogout() {
    if (itensCarrinho.length > 0) {
      feedback('error', 'Finalize ou cancele a venda em andamento antes de sair.')
      return
    }
    if (caixa) {
      feedback('error', 'Feche o caixa antes de sair.')
      return
    }
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-60 bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border flex items-center justify-center">
        {logoUrl ? (
          <img src={logoUrl} alt={nomeFarmacia} className="h-9 object-contain" />
        ) : nomeFarmacia ? (
          <h1 className="text-lg font-bold text-primary truncate">
            {nomeFarmacia}
          </h1>
        ) : (
          <Logo size="sm" />
        )}
      </div>

      {/* Status do caixa */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            caixa ? 'bg-success animate-pulse' : 'bg-muted-foreground/40',
          )} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Caixa {caixa ? 'Aberto' : 'Fechado'}
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {navItems.filter((item) => !user?.role || item.roles.includes(user.role as Role)).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé: usuário + logout + versão */}
      <div className="border-t border-border p-3 space-y-2">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{
                ({ boss: 'Admin Master', admin: 'Administrador', gerente: 'Gerente', operador: 'Operador' }[user.role]) ?? user.role
              }</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-2 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground/60 text-center">v{APP_VERSION}</p>
      </div>
    </aside>
  )
}
