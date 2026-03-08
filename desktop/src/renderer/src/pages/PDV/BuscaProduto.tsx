import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Barcode } from 'lucide-react'
import { useBuscarProdutos, useBuscarPorCodigoBarras } from '@/hooks/useProdutos'
import { useCarrinhoStore } from '@/stores/carrinhoStore'
import { cn } from '@/lib/utils'
import type { ProdutoResponse } from '@shared/produto'

interface BuscaProdutoProps {
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function BuscaProduto({ inputRef }: BuscaProdutoProps) {
  const [busca, setBusca] = useState('')
  const [modoBarcode, setModoBarcode] = useState(false)
  const [resultadosAbertos, setResultadosAbertos] = useState(false)
  const [indiceSelecionado, setIndiceSelecionado] = useState(0)
  const adicionarItem = useCarrinhoStore((s) => s.adicionarItem)

  const isBarcode = /^\d{8,}$/.test(busca)
  const { data: produtos } = useBuscarProdutos(!isBarcode ? busca : undefined)
  const { data: produtoBarcode } = useBuscarPorCodigoBarras(isBarcode ? busca : null)

  const resultados = isBarcode && produtoBarcode ? [produtoBarcode] : (produtos ?? [])

  useEffect(() => {
    setIndiceSelecionado(0)
    setResultadosAbertos(busca.length >= 1 && resultados.length > 0)
  }, [busca, resultados.length])

  // Barcode: adiciona direto ao pressionar Enter
  useEffect(() => {
    if (isBarcode && produtoBarcode) {
      adicionarItem(produtoBarcode)
      setBusca('')
      setResultadosAbertos(false)
    }
  }, [produtoBarcode, isBarcode, adicionarItem])

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
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isBarcode ? <Barcode size={20} /> : <Search size={20} />}
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
            'w-full h-14 pl-12 pr-4 text-lg',
            'bg-white border border-border rounded-xl',
            'shadow-sm focus:shadow-md focus:border-primary focus:outline-none',
            'transition-all placeholder:text-muted-foreground',
          )}
          autoFocus
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          Enter
        </div>
      </div>

      {resultadosAbertos && resultados.length > 0 && !isBarcode && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
          {resultados.slice(0, 8).map((produto, index) => (
            <button
              key={produto.id}
              onClick={() => selecionarProduto(produto)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                index === indiceSelecionado ? 'bg-primary/5 text-primary' : 'hover:bg-muted',
                index > 0 && 'border-t border-border',
              )}
            >
              <div>
                <p className="font-medium text-base">{produto.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {produto.codigoBarras ?? 'Sem código'} · Estoque: {produto.estoqueAtual}
                </p>
              </div>
              <span className="text-lg font-semibold tabular-nums">
                R$ {produto.precoVenda.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
