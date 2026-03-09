import { useState, useEffect } from 'react'
import { PackagePlus, PackageMinus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import type { ProdutoResponse } from '@shared/produto'

interface ModalAjusteEstoqueProps {
  aberto: boolean
  produto: ProdutoResponse | null
  onFechar: () => void
  onConfirmar: (produtoId: string, novoEstoque: number) => Promise<void>
  carregando: boolean
}

type TipoAjuste = 'entrada' | 'saida'

export function ModalAjusteEstoque({ aberto, produto, onFechar, onConfirmar, carregando }: ModalAjusteEstoqueProps) {
  const [tipo, setTipo] = useState<TipoAjuste>('entrada')
  const [quantidade, setQuantidade] = useState('')

  useEffect(() => {
    if (aberto) {
      setTipo('entrada')
      setQuantidade('')
    }
  }, [aberto])

  if (!produto) return null

  const qtd = parseInt(quantidade) || 0
  const novoEstoque = tipo === 'entrada'
    ? produto.estoqueAtual + qtd
    : Math.max(0, produto.estoqueAtual - qtd)
  const podeConfirmar = qtd > 0 && novoEstoque >= 0

  async function handleConfirmar() {
    if (!podeConfirmar || !produto) return
    await onConfirmar(produto.id, novoEstoque)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && podeConfirmar && !carregando) {
      e.preventDefault()
      handleConfirmar()
    }
  }

  return (
    <Modal.Root aberto={aberto} onFechar={onFechar}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Body>
          <Modal.Title className="mb-2">Ajustar Estoque</Modal.Title>
          <p className="text-muted-foreground mb-6">{produto.nome}</p>

          {/* Tipo de ajuste */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setTipo('entrada')}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all',
                tipo === 'entrada'
                  ? 'border-success bg-success/5 text-success'
                  : 'border-border hover:border-muted-foreground/30',
              )}
            >
              <PackagePlus size={20} />
              Entrada
            </button>
            <button
              onClick={() => setTipo('saida')}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all',
                tipo === 'saida'
                  ? 'border-error bg-error/5 text-error'
                  : 'border-border hover:border-muted-foreground/30',
              )}
            >
              <PackageMinus size={20} />
              Saída
            </button>
          </div>

          {/* Quantidade */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5">Quantidade</label>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              className="w-full h-12 px-4 rounded-lg border border-border bg-white text-base text-center font-semibold text-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="0"
            />
          </div>

          {/* Resumo */}
          <div className="bg-muted rounded-xl px-4 py-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estoque atual</span>
              <span className="font-semibold">{produto.estoqueAtual}</span>
            </div>
            {qtd > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{tipo === 'entrada' ? 'Adicionando' : 'Removendo'}</span>
                  <span className={cn('font-semibold', tipo === 'entrada' ? 'text-success' : 'text-error')}>
                    {tipo === 'entrada' ? '+' : '-'}{qtd}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-1">
                  <span>Novo estoque</span>
                  <span>{novoEstoque}</span>
                </div>
              </>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={onFechar}
            className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!podeConfirmar || carregando}
            className={cn(
              'flex-1 h-12 rounded-xl font-semibold text-white transition-all',
              podeConfirmar && !carregando
                ? 'bg-primary hover:bg-primary/90 shadow-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {carregando ? 'Salvando...' : 'Confirmar (Enter)'}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
