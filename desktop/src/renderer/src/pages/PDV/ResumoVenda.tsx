import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { formatarMoeda } from '@/lib/utils'

export function ResumoVenda() {
  const totalBruto = useCarrinhoStore((s) => s.totalBruto)
  const totalLiquido = useCarrinhoStore((s) => s.totalLiquido)
  const totalItens = useCarrinhoStore((s) => s.totalItens)
  const desconto = useCarrinhoStore((s) => s.desconto)

  return (
    <div className="bg-white rounded-xl border border-border shadow-md p-5 flex flex-col gap-3">
      <div className="flex justify-between text-base text-muted-foreground">
        <span>Itens</span>
        <span className="font-semibold tabular-nums">{totalItens()}</span>
      </div>

      <div className="flex justify-between text-base text-muted-foreground">
        <span>Subtotal</span>
        <span className="tabular-nums font-medium">{formatarMoeda(totalBruto())}</span>
      </div>

      {desconto > 0 && (
        <div className="flex justify-between text-base text-success">
          <span>Desconto</span>
          <span className="tabular-nums font-medium">- {formatarMoeda(desconto)}</span>
        </div>
      )}

      <div className="border-t-2 border-foreground/10 pt-3 mt-1">
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total</p>
        <p className="text-4xl font-black tabular-nums text-primary leading-none">
          {formatarMoeda(totalLiquido())}
        </p>
      </div>
    </div>
  )
}
