import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Package,
} from 'lucide-react'
import { useRelatorioVendas, useProdutosMaisVendidos, useAlertasEstoque } from '@/hooks/useRelatorios'
import { Badge } from '@/components/ui/Badge'
import { cn, formatarMoeda } from '@/lib/utils'
import type { FormaPagamento } from '@shared/venda'

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  DINHEIRO: 'Dinheiro',
  CARTAO_DEBITO: 'Cartão Débito',
  CARTAO_CREDITO: 'Cartão Crédito',
  PIX: 'PIX',
}

type Aba = 'vendas' | 'produtos' | 'estoque'

function dataHoje(): string {
  return new Date().toISOString().split('T')[0]
}

function data7DiasAtras(): string {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

function data30DiasAtras(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

export function Relatorios() {
  const [aba, setAba] = useState<Aba>('vendas')
  const [dataInicio, setDataInicio] = useState(data7DiasAtras)
  const [dataFim, setDataFim] = useState(dataHoje)

  const { data: vendasData, isLoading: loadingVendas } = useRelatorioVendas(
    dataInicio,
    dataFim,
    aba === 'vendas',
  )
  const { data: produtosData, isLoading: loadingProdutos } = useProdutosMaisVendidos(
    dataInicio,
    dataFim,
    20,
    aba === 'produtos',
  )
  const { data: alertasData, isLoading: loadingAlertas } = useAlertasEstoque()

  // Totais do período
  const totais = useMemo(() => {
    if (!vendasData) return { vendas: 0, faturamento: 0, desconto: 0 }
    return vendasData.reduce(
      (acc, dia) => ({
        vendas: acc.vendas + dia.quantidadeVendas,
        faturamento: acc.faturamento + dia.totalVendas,
        desconto: acc.desconto + dia.totalDesconto,
      }),
      { vendas: 0, faturamento: 0, desconto: 0 },
    )
  }, [vendasData])

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">Relatórios</h2>
        </div>
      </div>

      {/* Abas + Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([
            { id: 'vendas' as Aba, label: 'Vendas', icon: TrendingUp },
            { id: 'produtos' as Aba, label: 'Mais Vendidos', icon: Package },
            { id: 'estoque' as Aba, label: 'Alertas Estoque', icon: AlertTriangle },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                aba === tab.id
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtro de período */}
        {aba !== 'estoque' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setDataInicio(data7DiasAtras()); setDataFim(dataHoje()) }}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                7 dias
              </button>
              <button
                onClick={() => { setDataInicio(data30DiasAtras()); setDataFim(dataHoje()) }}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                30 dias
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-muted-foreground">até</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto">
        {aba === 'vendas' && (
          <AbaVendas data={vendasData ?? []} totais={totais} loading={loadingVendas} />
        )}
        {aba === 'produtos' && (
          <AbaProdutos data={produtosData ?? []} loading={loadingProdutos} />
        )}
        {aba === 'estoque' && (
          <AbaEstoque data={alertasData ?? []} loading={loadingAlertas} />
        )}
      </div>
    </div>
  )
}

// ─── Abas ───────────────────────────────────────────────────────

function AbaVendas({
  data,
  totais,
  loading,
}: {
  data: { data: string; totalVendas: number; quantidadeVendas: number; totalDesconto: number; vendasPorFormaPagamento: Record<string, { quantidade: number; total: number }> }[]
  totais: { vendas: number; faturamento: number; desconto: number }
  loading: boolean
}) {
  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4">
        <CardResumo label="Total de Vendas" valor={String(totais.vendas)} />
        <CardResumo label="Faturamento" valor={formatarMoeda(totais.faturamento)} destaque />
        <CardResumo label="Descontos" valor={formatarMoeda(totais.desconto)} />
      </div>

      {/* Tabela por dia */}
      <div className="bg-white rounded-xl border border-border shadow-md overflow-hidden">
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg">Nenhuma venda no período selecionado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-sm text-muted-foreground border-b border-border">
                <th className="py-3 px-4 font-medium text-left">Data</th>
                <th className="py-3 px-4 font-medium text-center">Vendas</th>
                <th className="py-3 px-4 font-medium text-right">Dinheiro</th>
                <th className="py-3 px-4 font-medium text-right">Débito</th>
                <th className="py-3 px-4 font-medium text-right">Crédito</th>
                <th className="py-3 px-4 font-medium text-right">PIX</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((dia, i) => {
                const dataFormatada = new Date(dia.data + 'T12:00:00').toLocaleDateString('pt-BR')
                return (
                  <tr key={dia.data} className={cn(i > 0 && 'border-t border-border/50')}>
                    <td className="py-3 px-4 font-medium">{dataFormatada}</td>
                    <td className="py-3 px-4 text-center">{dia.quantidadeVendas}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                      {formatarMoeda(dia.vendasPorFormaPagamento['DINHEIRO']?.total || 0)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                      {formatarMoeda(dia.vendasPorFormaPagamento['CARTAO_DEBITO']?.total || 0)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                      {formatarMoeda(dia.vendasPorFormaPagamento['CARTAO_CREDITO']?.total || 0)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                      {formatarMoeda(dia.vendasPorFormaPagamento['PIX']?.total || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums">
                      {formatarMoeda(dia.totalVendas)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function AbaProdutos({
  data,
  loading,
}: {
  data: { produtoId: string; nome: string; categoria: string | null; quantidadeVendida: number; totalFaturado: number }[]
  loading: boolean
}) {
  if (loading) return <Loading />

  return (
    <div className="bg-white rounded-xl border border-border shadow-md overflow-hidden">
      {data.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum dado no período selecionado</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-sm text-muted-foreground border-b border-border">
              <th className="py-3 px-4 font-medium text-center w-16">#</th>
              <th className="py-3 px-4 font-medium text-left">Produto</th>
              <th className="py-3 px-4 font-medium text-left">Categoria</th>
              <th className="py-3 px-4 font-medium text-center">Qtd. Vendida</th>
              <th className="py-3 px-4 font-medium text-right">Total Faturado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((produto, i) => (
              <tr key={produto.produtoId} className={cn(i > 0 && 'border-t border-border/50')}>
                <td className="py-3 px-4 text-center">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold',
                      i < 3
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">{produto.nome}</td>
                <td className="py-3 px-4 text-muted-foreground">{produto.categoria ?? '—'}</td>
                <td className="py-3 px-4 text-center font-semibold tabular-nums">
                  {produto.quantidadeVendida}
                </td>
                <td className="py-3 px-4 text-right font-bold tabular-nums">
                  {formatarMoeda(produto.totalFaturado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function AbaEstoque({
  data,
  loading,
}: {
  data: { produtoId: string; nome: string; categoria: string | null; estoqueAtual: number; estoqueMinimo: number }[]
  loading: boolean
}) {
  if (loading) return <Loading />

  return (
    <div className="bg-white rounded-xl border border-border shadow-md overflow-hidden">
      {data.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-success">
          <p className="text-lg">Nenhum produto com estoque baixo</p>
        </div>
      ) : (
        <>
          <div className="px-6 py-3 border-b border-border bg-warning/5">
            <p className="text-sm font-medium text-warning">
              {data.length} produto(s) com estoque abaixo do mínimo
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-sm text-muted-foreground border-b border-border">
                <th className="py-3 px-4 font-medium text-left">Produto</th>
                <th className="py-3 px-4 font-medium text-left">Categoria</th>
                <th className="py-3 px-4 font-medium text-center">Estoque Atual</th>
                <th className="py-3 px-4 font-medium text-center">Estoque Mínimo</th>
                <th className="py-3 px-4 font-medium text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {data.map((produto, i) => {
                const zerado = produto.estoqueAtual === 0
                return (
                  <tr key={produto.produtoId} className={cn(i > 0 && 'border-t border-border/50')}>
                    <td className="py-3 px-4 font-medium">{produto.nome}</td>
                    <td className="py-3 px-4 text-muted-foreground">{produto.categoria ?? '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn('font-bold tabular-nums', zerado ? 'text-error' : 'text-warning')}>
                        {produto.estoqueAtual}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-muted-foreground">
                      {produto.estoqueMinimo}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {zerado ? (
                        <Badge variante="error">Esgotado</Badge>
                      ) : (
                        <Badge variante="warning">Baixo</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

// ─── Componentes auxiliares ──────────────────────────────────────

function CardResumo({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm px-5 py-4">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums', destaque && 'text-primary')}>
        {valor}
      </p>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-lg text-muted-foreground">Carregando...</p>
    </div>
  )
}
