import { useState, useEffect, useCallback } from 'react'
import { Search, Barcode } from 'lucide-react'
import { useBuscarProdutos } from '@/hooks/useProdutos'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { cn, formatarMoeda } from '@/lib/utils'
import type { ProdutoResponse } from '@shared/produto'

interface BuscaProdutoProps {
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function BuscaProduto({ inputRef }: BuscaProdutoProps) {
  const [busca, setBusca] = useState('')
  const [resultadosAbertos, setResultadosAbertos] = useState(false)
  const [indiceSelecionado, setIndiceSelecionado] = useState(0)
  const adicionarItem = useCarrinhoStore((s) => s.adicionarItem)

  const isBarcode = /^\d{8,}$/.test(busca.trim())
  const { resultados } = useBuscarProdutos(busca)

  useEffect(() => {
    setIndiceSelecionado(0)
    setResultadosAbertos(busca.length >= 1 && resultados.length > 0)
  }, [busca, resultados.length])

  // Barcode com match exato: adiciona direto
  useEffect(() => {
    if (isBarcode && resultados.length === 1 && resultados[0]!.codigoBarras === busca.trim()) {
      adicionarItem(resultados[0]!)
      setBusca('')
      setResultadosAbertos(false)
    }
  }, [resultados, isBarcode, busca, adicionarItem])

  const selecionarProduto = useCallback((produto: ProdutoResponse) => {
    adicionarItem(produto)
    setBusca('')
    setResultadosAbertos(false)
    inputRef.current?.focus()
  }, [adicionarItem, inputRef])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!resultadosAbertos) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceSelecionado((prev) => Math.min(prev + 1, resultados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceSelecionado((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && resultados.length > 0 && !isBarcode) {
      e.preventDefault()
      selecionarProduto(resultados[indiceSelecionado]!)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isBarcode ? <Barcode size={22} /> : <Search size={22} />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => busca.length >= 1 && resultados.length > 0 && setResultadosAbertos(true)}
          onBlur={() => setTimeout(() => setResultadosAbertos(false), 200)}
          placeholder="Buscar produto por nome ou código de barras..."
          className={cn(
            'w-full h-14 pl-14 pr-24 text-lg',
            'bg-white border-2 border-primary/30 rounded-xl',
            'shadow-sm focus:shadow-md focus:border-primary focus:outline-none',
            'transition-all placeholder:text-muted-foreground/60',
          )}
          autoFocus
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-muted-foreground">
          <kbd className="px-2 py-0.5 bg-muted rounded border border-border font-mono font-semibold">Enter</kbd>
          <span>selecionar</span>
        </div>
      </div>

      {resultadosAbertos && resultados.length > 0 && !isBarcode && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-primary/20 rounded-xl shadow-xl overflow-hidden">
          {resultados.slice(0, 8).map((produto, index) => (
            <button
              key={produto.id}
              onClick={() => selecionarProduto(produto)}
              className={cn(
                'w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors',
                index === indiceSelecionado ? 'bg-primary/5' : 'hover:bg-muted/50',
                index > 0 && 'border-t border-border/50',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-base truncate">
                  {produto.nome}
                  {produto.laboratorio && (
                    <span className="text-sm text-muted-foreground font-normal ml-2">— {produto.laboratorio}</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {produto.codigoBarras ?? 'Sem código'} · Est: {produto.estoqueAtual}
                </p>
              </div>
              <span className="text-xl font-bold tabular-nums text-primary ml-4">
                {formatarMoeda(produto.precoVenda)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
