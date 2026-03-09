import { useState, useMemo } from 'react'
import {
  Wallet,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import {
  useListarContas,
  useCriarConta,
  usePagarConta,
  useCancelarConta,
  useFluxoCaixa,
} from '@/hooks/useFinanceiro'
import { Drawer } from '@/components/ui/Drawer'
import { InputMoeda } from '@/components/ui/InputMoeda'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { cn, formatarMoeda } from '@/lib/utils'
import type { TipoConta, StatusConta, ContaResponse } from '@shared/conta'

const STATUS_LABEL: Record<StatusConta, string> = {
  PENDENTE: 'Pendente',
  PAGA: 'Paga',
  CANCELADA: 'Cancelada',
}

const STATUS_BADGE: Record<StatusConta, 'warning' | 'success' | 'error'> = {
  PENDENTE: 'warning',
  PAGA: 'success',
  CANCELADA: 'error',
}

type Aba = 'contas' | 'fluxo'
const POR_PAGINA = 20

function dataHoje(): string {
  return new Date().toISOString().split('T')[0]
}

function data30DiasAtras(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

export function Financeiro() {
  const feedback = useFeedbackStore((s) => s.show)

  const [aba, setAba] = useState<Aba>('contas')
  const [pagina, setPagina] = useState(1)
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [confirmPagar, setConfirmPagar] = useState<ContaResponse | null>(null)
  const [confirmCancelar, setConfirmCancelar] = useState<ContaResponse | null>(null)

  // Fluxo de caixa
  const [fluxoInicio, setFluxoInicio] = useState(data30DiasAtras)
  const [fluxoFim, setFluxoFim] = useState(dataHoje)

  const { data: contasData, isLoading } = useListarContas(pagina, POR_PAGINA, {
    tipo: filtroTipo || undefined,
    status: filtroStatus || undefined,
  })
  const criarConta = useCriarConta()
  const pagarConta = usePagarConta()
  const cancelarConta = useCancelarConta()

  const { data: fluxoData, isLoading: loadingFluxo } = useFluxoCaixa(
    fluxoInicio,
    fluxoFim,
    aba === 'fluxo',
  )

  const contas = contasData?.dados ?? []
  const totalPaginas = contasData?.totalPaginas ?? 1
  const total = contasData?.total ?? 0

  // Totais do fluxo
  const fluxoTotais = useMemo(() => {
    if (!fluxoData) return { entradas: 0, saidas: 0, saldo: 0 }
    return fluxoData.reduce(
      (acc, item) => ({
        entradas: acc.entradas + item.entradas,
        saidas: acc.saidas + item.saidas,
        saldo: acc.saldo + item.saldo,
      }),
      { entradas: 0, saidas: 0, saldo: 0 },
    )
  }, [fluxoData])

  // ─── Form nova conta ──────────────────────────────────────────
  const [formTipo, setFormTipo] = useState<TipoConta>('PAGAR')
  const [formDescricao, setFormDescricao] = useState('')
  const [formValor, setFormValor] = useState(0)
  const [formCategoria, setFormCategoria] = useState('')
  const [formVencimento, setFormVencimento] = useState('')

  function resetForm() {
    setFormTipo('PAGAR')
    setFormDescricao('')
    setFormValor(0)
    setFormCategoria('')
    setFormVencimento('')
  }

  async function handleCriar() {
    if (!formDescricao || formValor <= 0 || !formVencimento) {
      feedback('error', 'Preencha todos os campos obrigatórios.')
      return
    }
    try {
      await criarConta.mutateAsync({
        tipo: formTipo,
        descricao: formDescricao,
        valor: formValor,
        categoria: formCategoria || undefined,
        dataVencimento: formVencimento,
      })
      feedback('success', 'Conta cadastrada com sucesso!')
      setDrawerAberto(false)
      resetForm()
    } catch {
      feedback('error', 'Erro ao cadastrar conta.')
    }
  }

  async function handlePagar() {
    if (!confirmPagar) return
    try {
      await pagarConta.mutateAsync(confirmPagar.id)
      feedback('success', 'Conta marcada como paga!')
      setConfirmPagar(null)
    } catch {
      feedback('error', 'Erro ao marcar conta como paga.')
    }
  }

  async function handleCancelar() {
    if (!confirmCancelar) return
    try {
      await cancelarConta.mutateAsync(confirmCancelar.id)
      feedback('success', 'Conta cancelada!')
      setConfirmCancelar(null)
    } catch {
      feedback('error', 'Erro ao cancelar conta.')
    }
  }

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">Financeiro</h2>
        </div>

        {aba === 'contas' && (
          <button
            onClick={() => {
              resetForm()
              setDrawerAberto(true)
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Nova Conta
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setAba('contas')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              aba === 'contas'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Wallet size={16} />
            Contas
          </button>
          <button
            onClick={() => setAba('fluxo')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              aba === 'fluxo'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <TrendingUp size={16} />
            Fluxo de Caixa
          </button>
        </div>

        {/* Filtros */}
        {aba === 'contas' && (
          <div className="flex items-center gap-3">
            <select
              value={filtroTipo}
              onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1) }}
              className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Todos os tipos</option>
              <option value="PAGAR">A Pagar</option>
              <option value="RECEBER">A Receber</option>
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1) }}
              className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGA">Paga</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        )}

        {aba === 'fluxo' && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <input
              type="date"
              value={fluxoInicio}
              onChange={(e) => setFluxoInicio(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-muted-foreground">até</span>
            <input
              type="date"
              value={fluxoFim}
              onChange={(e) => setFluxoFim(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {aba === 'contas' ? (
        <div className="flex-1 bg-white rounded-xl border border-border shadow-md overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg text-muted-foreground">Carregando...</p>
            </div>
          ) : contas.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg text-muted-foreground">Nenhuma conta encontrada</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-muted-foreground border-b border-border">
                    <th className="py-3 px-4 font-medium text-left">Descrição</th>
                    <th className="py-3 px-4 font-medium text-center">Tipo</th>
                    <th className="py-3 px-4 font-medium text-right">Valor</th>
                    <th className="py-3 px-4 font-medium text-center">Vencimento</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                    <th className="py-3 px-4 font-medium text-center w-28">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((conta, i) => {
                    const vencida =
                      conta.status === 'PENDENTE' &&
                      new Date(conta.dataVencimento) < new Date()
                    return (
                      <tr
                        key={conta.id}
                        className={cn(
                          'transition-colors hover:bg-muted/50',
                          i > 0 && 'border-t border-border/50',
                        )}
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium">{conta.descricao}</p>
                          {conta.categoria && (
                            <p className="text-sm text-muted-foreground">{conta.categoria}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variante={conta.tipo === 'PAGAR' ? 'error' : 'success'}>
                            {conta.tipo === 'PAGAR' ? 'A Pagar' : 'A Receber'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium tabular-nums">
                          {formatarMoeda(conta.valor)}
                        </td>
                        <td className={cn('py-3 px-4 text-center', vencida && 'text-error font-semibold')}>
                          {new Date(conta.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                          {vencida && <span className="block text-xs">Vencida</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variante={STATUS_BADGE[conta.status]}>
                            {STATUS_LABEL[conta.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {conta.status === 'PENDENTE' && (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setConfirmPagar(conta)}
                                className="p-2 text-muted-foreground hover:text-success rounded-lg hover:bg-success/10 transition-colors"
                                title="Marcar como paga"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => setConfirmCancelar(conta)}
                                className="p-2 text-muted-foreground hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                                title="Cancelar"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Página {pagina} de {totalPaginas} · {total} contas
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagina(Math.max(1, pagina - 1))}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fluxo de Caixa */
        <div className="flex-1 space-y-5 overflow-auto">
          {/* Cards totais */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-success" />
                <p className="text-sm text-muted-foreground">Total Entradas</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-success">
                {formatarMoeda(fluxoTotais.entradas)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-error" />
                <p className="text-sm text-muted-foreground">Total Saídas</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-error">
                {formatarMoeda(fluxoTotais.saidas)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={18} className="text-primary" />
                <p className="text-sm text-muted-foreground">Saldo</p>
              </div>
              <p
                className={cn(
                  'text-xl font-bold tabular-nums',
                  fluxoTotais.saldo >= 0 ? 'text-success' : 'text-error',
                )}
              >
                {formatarMoeda(fluxoTotais.saldo)}
              </p>
            </div>
          </div>

          {/* Tabela diária */}
          <div className="bg-white rounded-xl border border-border shadow-md overflow-hidden">
            {loadingFluxo ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-lg text-muted-foreground">Carregando...</p>
              </div>
            ) : !fluxoData || fluxoData.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg">Nenhum movimento no período</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-muted-foreground border-b border-border">
                    <th className="py-3 px-4 font-medium text-left">Data</th>
                    <th className="py-3 px-4 font-medium text-right">Entradas</th>
                    <th className="py-3 px-4 font-medium text-right">Saídas</th>
                    <th className="py-3 px-4 font-medium text-right">Saldo do Dia</th>
                  </tr>
                </thead>
                <tbody>
                  {fluxoData.map((item, i) => (
                    <tr key={item.data} className={cn(i > 0 && 'border-t border-border/50')}>
                      <td className="py-3 px-4 font-medium">
                        {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-success font-medium">
                        {formatarMoeda(item.entradas)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-error font-medium">
                        {formatarMoeda(item.saidas)}
                      </td>
                      <td
                        className={cn(
                          'py-3 px-4 text-right tabular-nums font-bold',
                          item.saldo >= 0 ? 'text-success' : 'text-error',
                        )}
                      >
                        {formatarMoeda(item.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Drawer nova conta */}
      <Drawer
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        titulo="Nova Conta"
      >
        <div className="space-y-5">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Tipo *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormTipo('PAGAR')}
                className={cn(
                  'px-4 py-3 rounded-xl border-2 font-medium transition-all',
                  formTipo === 'PAGAR'
                    ? 'border-error bg-error/5 text-error'
                    : 'border-border hover:border-muted-foreground/30',
                )}
              >
                A Pagar
              </button>
              <button
                onClick={() => setFormTipo('RECEBER')}
                className={cn(
                  'px-4 py-3 rounded-xl border-2 font-medium transition-all',
                  formTipo === 'RECEBER'
                    ? 'border-success bg-success/5 text-success'
                    : 'border-border hover:border-muted-foreground/30',
                )}
              >
                A Receber
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Descrição *</label>
            <input
              value={formDescricao}
              onChange={(e) => setFormDescricao(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Ex: Conta de luz"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Valor *</label>
            <InputMoeda value={formValor} onChange={setFormValor} />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Categoria</label>
            <input
              value={formCategoria}
              onChange={(e) => setFormCategoria(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Ex: Utilidades"
            />
          </div>

          {/* Data de vencimento */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Data de Vencimento *</label>
            <input
              type="date"
              value={formVencimento}
              onChange={(e) => setFormVencimento(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setDrawerAberto(false)}
              className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCriar}
              disabled={criarConta.isPending}
              className={cn(
                'flex-1 h-12 rounded-xl font-semibold text-white transition-all',
                criarConta.isPending
                  ? 'bg-primary/60 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 shadow-md',
              )}
            >
              {criarConta.isPending ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </Drawer>

      {/* Confirm pagar */}
      <ConfirmDialog
        aberto={!!confirmPagar}
        titulo="Marcar como Paga"
        mensagem={`Confirmar pagamento de "${confirmPagar?.descricao}" no valor de ${confirmPagar ? formatarMoeda(confirmPagar.valor) : ''}?`}
        textoBotao="Confirmar Pagamento"
        variante="warning"
        carregando={pagarConta.isPending}
        onConfirmar={handlePagar}
        onCancelar={() => setConfirmPagar(null)}
      />

      {/* Confirm cancelar */}
      <ConfirmDialog
        aberto={!!confirmCancelar}
        titulo="Cancelar Conta"
        mensagem={`Cancelar "${confirmCancelar?.descricao}"? Esta ação não pode ser desfeita.`}
        textoBotao="Cancelar Conta"
        variante="danger"
        carregando={cancelarConta.isPending}
        onConfirmar={handleCancelar}
        onCancelar={() => setConfirmCancelar(null)}
      />
    </div>
  )
}
