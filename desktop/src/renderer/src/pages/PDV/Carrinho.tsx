import { Trash2, Minus, Plus } from 'lucide-react'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { cn } from '@/lib/utils'

export function Carrinho() {
  const itens = useCarrinhoStore((s) => s.itens)
  const removerItem = useCarrinhoStore((s) => s.removerItem)
  const alterarQuantidade = useCarrinhoStore((s) => s.alterarQuantidade)

  if (itens.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-lg">Nenhum produto adicionado</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="text-sm text-muted-foreground border-b border-border">
            <th className="text-left py-3 px-4 font-medium">Produto</th>
            <th className="text-center py-3 px-2 font-medium w-36">Qtd</th>
            <th className="text-right py-3 px-4 font-medium w-28">Unit.</th>
            <th className="text-right py-3 px-4 font-medium w-28">Subtotal</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, index) => (
            <tr
              key={item.produtoId}
              className={cn(
                'transition-colors hover:bg-muted/50',
                index > 0 && 'border-t border-border/50',
              )}
            >
              <td className="py-3 px-4">
                <p className="font-medium text-base">{item.nome}</p>
                {item.codigoBarras && (
                  <p className="text-sm text-muted-foreground">{item.codigoBarras}</p>
                )}
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => alterarQuantidade(item.produtoId, item.quantidade - 1)}
                    className="p-1.5 rounded-lg hover:bg-border transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => alterarQuantidade(item.produtoId, parseInt(e.target.value) || 0)}
                    className="w-14 text-center font-semibold text-base bg-muted rounded-lg py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    min={1}
                  />
                  <button
                    onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
                    className="p-1.5 rounded-lg hover:bg-border transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </td>
              <td className="py-3 px-4 text-right tabular-nums">
                R$ {item.precoUnit.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right font-semibold tabular-nums">
                R$ {item.subtotal.toFixed(2)}
              </td>
              <td className="py-3 pr-3">
                <button
                  onClick={() => removerItem(item.produtoId)}
                  className="p-2 text-muted-foreground hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                  title="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
