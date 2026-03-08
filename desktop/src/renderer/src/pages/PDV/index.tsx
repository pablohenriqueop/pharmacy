import { useState, useRef, useCallback, useMemo } from 'react'
import { ShoppingCart, AlertTriangle } from 'lucide-react'
import { BuscaProduto } from './BuscaProduto'
import { Carrinho } from './Carrinho'
import { ResumoVenda } from './ResumoVenda'
import { ModalPagamento } from './ModalPagamento'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { useToastStore } from '@/stores/toastStore'
import { useCaixaAberto } from '@/hooks/useCaixa'
import { useCriarVenda } from '@/hooks/useVenda'
import { useAtalhos } from '@/hooks/useAtalhos'
import { cn } from '@/lib/utils'
import type { FormaPagamento } from '@shared/venda'

export function PDV() {
  const [modalPagamento, setModalPagamento] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const itens = useCarrinhoStore((s) => s.itens)
  const desconto = useCarrinhoStore((s) => s.desconto)
  const limpar = useCarrinhoStore((s) => s.limpar)
  const totalLiquido = useCarrinhoStore((s) => s.totalLiquido)

  const { data: caixa, isLoading: caixaLoading } = useCaixaAberto()
  const criarVenda = useCriarVenda()
  const toast = useToastStore((s) => s.show)

  const novaVenda = useCallback(() => {
    limpar()
    inputRef.current?.focus()
  }, [limpar])

  const abrirPagamento = useCallback(() => {
    if (itens.length === 0) {
      toast('error', 'Adicione pelo menos um produto')
      return
    }
    if (!caixa) {
      toast('error', 'Nenhum caixa aberto. Abra um caixa primeiro.')
      return
    }
    setModalPagamento(true)
  }, [itens.length, caixa, toast])

  const confirmarPagamento = useCallback(
    async (forma: FormaPagamento, valorPago?: number) => {
      if (!caixa) return

      try {
        const venda = await criarVenda.mutateAsync({
          caixaId: caixa.id,
          formaPagamento: forma,
          desconto: desconto > 0 ? desconto : undefined,
          valorPago,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnit: i.precoUnit,
          })),
        })

        const trocoMsg =
          forma === 'DINHEIRO' && venda.troco && venda.troco > 0
            ? ` · Troco: R$ ${Number(venda.troco).toFixed(2)}`
            : ''

        toast('success', `Venda finalizada! Total: R$ ${Number(venda.total).toFixed(2)}${trocoMsg}`)
        setModalPagamento(false)
        limpar()
        inputRef.current?.focus()
      } catch {
        toast('error', 'Erro ao finalizar venda. Tente novamente.')
      }
    },
    [caixa, criarVenda, desconto, itens, limpar, toast],
  )

  const atalhos = useMemo(
    () => ({
      F2: novaVenda,
      F10: abrirPagamento,
      Escape: () => {
        if (modalPagamento) {
          setModalPagamento(false)
        } else {
          novaVenda()
        }
      },
    }),
    [novaVenda, abrirPagamento, modalPagamento],
  )

  useAtalhos(atalhos)

  if (caixaLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!caixa) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle size={48} className="text-warning" />
        <h2 className="text-2xl font-bold">Nenhum caixa aberto</h2>
        <p className="text-muted-foreground text-lg">
          Abra um caixa na página "Caixa" para começar a vender.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header com atalhos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">Ponto de Venda</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <kbd className="px-2 py-1 bg-muted rounded font-mono text-xs">F2</kbd>
          <span>Nova venda</span>
          <span className="mx-2">·</span>
          <kbd className="px-2 py-1 bg-muted rounded font-mono text-xs">F10</kbd>
          <span>Finalizar</span>
          <span className="mx-2">·</span>
          <kbd className="px-2 py-1 bg-muted rounded font-mono text-xs">Esc</kbd>
          <span>Cancelar</span>
        </div>
      </div>

      {/* Busca */}
      <BuscaProduto inputRef={inputRef} />

      {/* Carrinho + Resumo */}
      <div className="flex-1 bg-white rounded-xl border border-border shadow-md flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-base text-muted-foreground">
            Itens da Venda
          </h3>
        </div>

        <div className="flex-1 overflow-auto px-2">
          <Carrinho />
        </div>

        <div className="px-6 pb-5">
          <ResumoVenda />
        </div>
      </div>

      {/* Botão Finalizar */}
      <button
        onClick={abrirPagamento}
        disabled={itens.length === 0}
        className={cn(
          'h-16 rounded-xl text-xl font-bold transition-all shadow-md',
          itens.length > 0
            ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-[0.99]'
            : 'bg-muted text-muted-foreground cursor-not-allowed',
        )}
      >
        Finalizar Venda — R$ {totalLiquido().toFixed(2)} (F10)
      </button>

      {/* Modal de Pagamento */}
      <ModalPagamento
        aberto={modalPagamento}
        onFechar={() => setModalPagamento(false)}
        onConfirmar={confirmarPagamento}
        carregando={criarVenda.isPending}
      />
    </div>
  )
}
