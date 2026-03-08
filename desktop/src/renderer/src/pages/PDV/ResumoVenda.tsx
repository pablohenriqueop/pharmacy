import { useCarrinhoStore } from '@/stores/carrinhoStore'

export function ResumoVenda() {
  const totalBruto = useCarrinhoStore((s) => s.totalBruto)
  const totalLiquido = useCarrinhoStore((s) => s.totalLiquido)
  const totalItens = useCarrinhoStore((s) => s.totalItens)
  const desconto = useCarrinhoStore((s) => s.desconto)

  return (
    <div className="border-t border-border pt-4 space-y-2">
      <div className="flex justify-between text-base text-muted-foreground">
        <span>Itens ({totalItens()})</span>
        <span className="tabular-nums">R$ {totalBruto().toFixed(2)}</span>
      </div>

      {desconto > 0 && (
        <div className="flex justify-between text-base text-success">
          <span>Desconto</span>
          <span className="tabular-nums">- R$ {desconto.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between text-2xl font-bold pt-2 border-t border-border">
        <span>Total</span>
        <span className="tabular-nums text-primary">
          R$ {totalLiquido().toFixed(2)}
        </span>
      </div>
    </div>
  )
}
