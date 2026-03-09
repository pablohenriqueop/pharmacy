import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { sessao } = useAuth()

  if (sessao.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!sessao.data) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
