import { useState, useRef, useCallback, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { BuscaProduto } from './BuscaProduto'
import { Carrinho } from './Carrinho'
import { ResumoVenda } from './ResumoVenda'
import { ModalPagamento } from './ModalPagamento'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { useCaixaAberto } from '@/hooks/useCaixa'
import { useCriarVenda } from '@/hooks/useVenda'
import { useAtalhos } from '@/hooks/useAtalhos'
import { formatarMoeda } from '@/lib/utils'
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
  const feedback = useFeedbackStore((s) => s.show)

  const novaVenda = useCallback(() => {
    limpar()
    inputRef.current?.focus()
  }, [limpar])

  const abrirPagamento = useCallback(() => {
    if (itens.length === 0) {
      feedback('error', 'Adicione pelo menos um produto')
      return
    }
    if (!caixa) {
      feedback('error', 'Nenhum caixa aberto. Abra um caixa primeiro.')
      return
    }
    setModalPagamento(true)
  }, [itens.length, caixa, feedback])

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
            ? ` · Troco: ${formatarMoeda(venda.troco)}`
            : ''

        feedback('success', `Venda finalizada! Total: ${formatarMoeda(venda.total)}${trocoMsg}`)
        setModalPagamento(false)
        limpar()
        inputRef.current?.focus()
      } catch {
        feedback('error', 'Erro ao finalizar venda. Tente novamente.')
      }
    },
    [caixa, criarVenda, desconto, itens, limpar, feedback],
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
        <AlertTriangle size={56} className="text-warning" />
        <h2 className="text-3xl font-bold">Nenhum caixa aberto</h2>
        <p className="text-muted-foreground text-lg">
          Abra um caixa na página "Caixa" para começar a vender.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Busca — topo */}
      <div className="mb-4">
        <BuscaProduto inputRef={inputRef} />
      </div>

      {/* Corpo: Carrinho (esquerda) + Resumo (direita) */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Carrinho — ocupa 2/3 */}
        <div className="flex-1 bg-white rounded-xl border border-border shadow-md flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
            <h3 className="font-bold text-base uppercase tracking-wide text-muted-foreground">
              Itens da Venda
            </h3>
            <span className="text-sm text-muted-foreground font-medium">
              {itens.length} {itens.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <Carrinho />
          </div>
        </div>

        {/* Painel direito — resumo + botão */}
        <div className="w-80 flex flex-col gap-4">
          <ResumoVenda />

          {/* Botão Finalizar */}
          <button
            onClick={abrirPagamento}
            disabled={itens.length === 0}
            className={
              itens.length > 0
                ? 'h-16 rounded-xl text-xl font-bold bg-success text-white shadow-lg hover:bg-success/90 hover:shadow-xl active:scale-[0.99] transition-all'
                : 'h-16 rounded-xl text-xl font-bold bg-muted text-muted-foreground cursor-not-allowed'
            }
          >
            Finalizar (F10)
          </button>
        </div>
      </div>

      {/* Barra de atalhos — rodapé fixo */}
      <div className="mt-4 flex items-center gap-6 bg-foreground/[0.03] border border-border rounded-xl px-6 py-2.5">
        <Atalho tecla="F2" descricao="Nova venda" />
        <div className="w-px h-5 bg-border" />
        <Atalho tecla="F10" descricao="Finalizar" />
        <div className="w-px h-5 bg-border" />
        <Atalho tecla="Esc" descricao="Cancelar" />
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground font-medium tabular-nums">
          Total: <span className="text-foreground font-bold text-lg">{formatarMoeda(totalLiquido())}</span>
        </span>
      </div>

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

function Atalho({ tecla, descricao }: { tecla: string; descricao: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="px-2.5 py-1 bg-primary/10 text-primary rounded font-mono text-xs font-bold border border-primary/20 min-w-[2rem] text-center">
        {tecla}
      </kbd>
      <span className="text-sm text-muted-foreground">{descricao}</span>
    </div>
  )
}
