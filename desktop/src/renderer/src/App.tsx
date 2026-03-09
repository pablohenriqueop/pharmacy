import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { queryClient } from '@/lib/query'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ModalFeedback } from '@/components/ui/ModalFeedback'
import { Login } from '@/pages/Login'
import { PDV } from '@/pages/PDV'
import { Produtos } from '@/pages/Produtos'
import { Caixa } from '@/pages/Caixa'
import { Vendas } from '@/pages/Vendas'
import { Relatorios } from '@/pages/Relatorios'
import { Financeiro } from '@/pages/Financeiro'
import { Configuracoes } from '@/pages/Configuracoes'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Login público */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<PDV />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/caixa" element={<Caixa />} />
              <Route path="/vendas" element={<Vendas />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ModalFeedback />
    </QueryClientProvider>
  )
}
