import { Trash2, Minus, Plus } from 'lucide-react'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { cn, formatarMoeda } from '@/lib/utils'

export function Carrinho() {
  const itens = useCarrinhoStore((s) => s.itens)
  const removerItem = useCarrinhoStore((s) => s.removerItem)
  const alterarQuantidade = useCarrinhoStore((s) => s.alterarQuantidade)

  if (itens.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground py-16">
        <p className="text-lg">Nenhum produto adicionado</p>
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="text-sm text-muted-foreground border-b border-border bg-muted/20">
          <th className="text-center py-2.5 px-3 font-semibold w-12">#</th>
          <th className="text-left py-2.5 px-3 font-semibold">Produto</th>
          <th className="text-center py-2.5 px-3 font-semibold w-36">Qtd</th>
          <th className="text-right py-2.5 px-3 font-semibold w-28">Unit.</th>
          <th className="text-right py-2.5 px-3 font-semibold w-32">Subtotal</th>
          <th className="w-12"></th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item, index) => (
          <tr
            key={item.produtoId}
            className={cn(
              'transition-colors hover:bg-primary/[0.03]',
              index > 0 && 'border-t border-border/50',
            )}
          >
            <td className="py-3 px-3 text-center text-sm text-muted-foreground font-mono">
              {String(index + 1).padStart(2, '0')}
            </td>
            <td className="py-3 px-3">
              <p className="font-semibold text-base leading-tight">{item.nome}</p>
              {item.codigoBarras && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.codigoBarras}</p>
              )}
            </td>
            <td className="py-3 px-3">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => alterarQuantidade(item.produtoId, item.quantidade - 1)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.quantidade}
                  onChange={(e) => {
                    const v = parseInt(e.target.value)
                    if (!isNaN(v) && v > 0) alterarQuantidade(item.produtoId, v)
                  }}
                  className="w-12 text-center font-bold text-base bg-muted/60 rounded-lg py-1 border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </td>
            <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
              {formatarMoeda(item.precoUnit)}
            </td>
            <td className="py-3 px-3 text-right font-bold tabular-nums text-lg">
              {formatarMoeda(item.subtotal)}
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
  )
}
