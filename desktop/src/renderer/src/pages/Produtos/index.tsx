import { useState, useCallback, useMemo, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Package, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { TabelaProdutos } from './TabelaProdutos'
import { DrawerProduto } from './DrawerProduto'
import { ModalAjusteEstoque } from './ModalAjusteEstoque'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PinModais } from '@/components/ui/PinProvider'
import { useListarProdutos, useCriarProduto, useDesativarProduto } from '@/hooks/useProdutos'
import { useAtalhos } from '@/hooks/useAtalhos'
import { usePin } from '@/hooks/usePin'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ProdutoResponse, CriarProdutoRequest, AtualizarProdutoRequest } from '@shared/produto'

const POR_PAGINA = 20

export function Produtos() {
  const role = useAuthStore((s) => s.user?.role)
  const podeEditar = role === 'boss' || role === 'admin' || role === 'gerente'
  const podeDesativar = role === 'boss' || role === 'admin'
  const feedback = useFeedbackStore((s) => s.show)
  const queryClient = useQueryClient()
  const { solicitarPin, modalState: pinModalState } = usePin()

  // ─── Estado ────────────────────────────────────────────
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState(true)
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)

  const [drawerAberto, setDrawerAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ProdutoResponse | null>(null)
  const [modalEstoque, setModalEstoque] = useState<ProdutoResponse | null>(null)
  const [confirmDesativar, setConfirmDesativar] = useState<ProdutoResponse | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // ─── Queries & Mutations ───────────────────────────────
  const { data, isLoading } = useListarProdutos(pagina, POR_PAGINA, {
    nome: buscaDebounced || undefined,
    ativo: filtroAtivo,
  })

  const criarProduto = useCriarProduto()
  const desativarProduto = useDesativarProduto()

  // ─── Busca com debounce ────────────────────────────────
  function handleBusca(valor: string) {
    setBusca(valor)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setBuscaDebounced(valor)
      setPagina(1)
    }, 300)
  }

  // ─── Handlers ──────────────────────────────────────────
  const abrirNovo = useCallback(() => {
    setProdutoEditando(null)
    setDrawerAberto(true)
  }, [])

  const abrirEditar = useCallback((produto: ProdutoResponse) => {
    setProdutoEditando(produto)
    setDrawerAberto(true)
  }, [])

  const abrirAjusteEstoque = useCallback(() => {
    if (!selecionadoId || !data) {
      feedback('info', 'Selecione um produto na tabela primeiro.')
      return
    }
    const produto = data.dados.find((p) => p.id === selecionadoId)
    if (produto) setModalEstoque(produto)
  }, [selecionadoId, data, feedback])

  const focarBusca = useCallback(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  async function handleSalvar(formData: CriarProdutoRequest | AtualizarProdutoRequest & { precoVenda: number; precoCusto?: number }) {
    try {
      if (produtoEditando) {
        // Editar
        const { data: atualizado } = await api.put<ProdutoResponse>(
          `/api/produtos/${produtoEditando.id}`,
          formData,
        )
        if (atualizado) {
          feedback('success', 'Produto atualizado com sucesso!')
        }
      } else {
        // Criar
        await criarProduto.mutateAsync(formData as CriarProdutoRequest)
        feedback('success', 'Produto cadastrado com sucesso!')
      }
      setDrawerAberto(false)
      setProdutoEditando(null)
    } catch {
      feedback('error', 'Erro ao salvar produto. Tente novamente.')
    }
  }

  async function handleAjusteEstoque(produtoId: string, novoEstoque: number) {
    try {
      await api.put(`/api/produtos/${produtoId}`, { estoqueAtual: novoEstoque })
      feedback('success', 'Estoque atualizado com sucesso!')
      setModalEstoque(null)
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['catalogo-produtos'] })
    } catch {
      feedback('error', 'Erro ao ajustar estoque.')
    }
  }

  async function handleDesativar() {
    if (!confirmDesativar) return

    const pin = await solicitarPin(`Confirme para desativar "${confirmDesativar.nome}".`)
    if (!pin) return // cancelou

    try {
      await desativarProduto.mutateAsync({ id: confirmDesativar.id, pin })
      feedback('success', `"${confirmDesativar.nome}" foi desativado.`)
      setConfirmDesativar(null)
      setSelecionadoId(null)
    } catch {
      feedback('error', 'Erro ao desativar produto.')
    }
  }

  // ─── Atalhos ───────────────────────────────────────────
  const atalhos = useMemo(() => ({
    F3: () => podeEditar && abrirNovo(),
    F4: () => podeEditar && abrirAjusteEstoque(),
    '/': focarBusca,
  }), [podeEditar, abrirNovo, abrirAjusteEstoque, focarBusca])

  useAtalhos(atalhos)

  // ─── Dados ─────────────────────────────────────────────
  const produtos = data?.dados ?? []
  const totalPaginas = data?.totalPaginas ?? 1
  const total = data?.total ?? 0

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">Produtos</h2>
          {total > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-semibold">
              {total}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Atalhos */}
          <div className="flex items-center gap-4 bg-foreground/[0.03] border border-border rounded-xl px-4 py-2 text-sm">
            {podeEditar && (
              <>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-xs font-bold border border-primary/20">F3</kbd>
                  <span className="text-muted-foreground">Novo</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-xs font-bold border border-primary/20">F4</kbd>
                  <span className="text-muted-foreground">Estoque</span>
                </div>
                <div className="w-px h-4 bg-border" />
              </>
            )}
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-xs font-bold border border-primary/20">/</kbd>
              <span className="text-muted-foreground">Buscar</span>
            </div>
          </div>

          {podeEditar && (
            <button
              onClick={abrirNovo}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Novo Produto
            </button>
          )}
        </div>
      </div>

      {/* Busca + Filtros */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
            placeholder="Buscar por nome ou código de barras..."
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <button
          onClick={() => { setFiltroAtivo(!filtroAtivo); setPagina(1) }}
          className={cn(
            'flex items-center gap-2 h-12 px-5 rounded-xl border font-semibold transition-all',
            filtroAtivo
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border hover:bg-muted text-muted-foreground',
          )}
        >
          <Filter size={18} />
          {filtroAtivo ? 'Apenas ativos' : 'Todos'}
        </button>
      </div>

      {/* Tabela */}
      <div className="flex-1 bg-white rounded-xl border border-border shadow-md overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <TabelaProdutos
              produtos={produtos}
              selecionadoId={selecionadoId}
              onSelecionar={setSelecionadoId}
              onEditar={abrirEditar}
              onAjustarEstoque={(p) => setModalEstoque(p)}
              onDesativar={(p) => setConfirmDesativar(p)}
            />
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas} · {total} produtos
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

      {/* Drawer criar/editar */}
      <DrawerProduto
        aberto={drawerAberto}
        produto={produtoEditando}
        onFechar={() => { setDrawerAberto(false); setProdutoEditando(null) }}
        onSalvar={handleSalvar}
        carregando={criarProduto.isPending}
      />

      {/* Modal ajuste de estoque */}
      <ModalAjusteEstoque
        aberto={!!modalEstoque}
        produto={modalEstoque}
        onFechar={() => setModalEstoque(null)}
        onConfirmar={handleAjusteEstoque}
        carregando={false}
      />

      {/* Confirmação de desativação */}
      <ConfirmDialog
        aberto={!!confirmDesativar}
        titulo="Desativar Produto"
        mensagem={`"${confirmDesativar?.nome}" não aparecerá mais no PDV. Você pode reativá-lo depois.`}
        textoBotao="Desativar"
        variante="danger"
        carregando={desativarProduto.isPending}
        onConfirmar={handleDesativar}
        onCancelar={() => setConfirmDesativar(null)}
      />

      {/* Modais de PIN */}
      <PinModais modalState={pinModalState} />
    </div>
  )
}

