import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useConfig } from '@/hooks/useConfig'

export function MainLayout() {
  const { data: config } = useConfig()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        nomeFarmacia={config?.nomeFarmacia}
        logoUrl={config?.logoUrl}
      />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
