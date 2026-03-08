import { NavLink } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  CreditCard,
  BarChart3,
  DollarSign,
  FileText,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: ShoppingCart, label: 'PDV' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/caixa', icon: CreditCard, label: 'Caixa' },
  { to: '/vendas', icon: FileText, label: 'Vendas' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

interface SidebarProps {
  nomeFarmacia?: string
  logoUrl?: string | null
}

export function Sidebar({ nomeFarmacia, logoUrl }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col shadow-sm">
      <div className="p-6 border-b border-border">
        {logoUrl ? (
          <img src={logoUrl} alt={nomeFarmacia} className="h-10 object-contain" />
        ) : (
          <h1 className="text-xl font-bold text-primary truncate">
            {nomeFarmacia ?? 'PHarmacy'}
          </h1>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
