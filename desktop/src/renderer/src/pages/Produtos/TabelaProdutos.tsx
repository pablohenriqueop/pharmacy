import { useState } from 'react'
import { Pencil, Trash2, PackagePlus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn, formatarMoeda } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'
import type { ProdutoResponse } from '@shared/produto'

type ColunaOrdenavel = 'nome' | 'categoria' | 'precoVenda' | 'estoqueAtual'
type Direcao = 'asc' | 'desc'

interface TabelaProdutosProps {
  produtos: ProdutoResponse[]
  selecionadoId: string | null
  onSelecionar: (id: string) => void
  onEditar: (produto: ProdutoResponse) => void
  onAjustarEstoque: (produto: ProdutoResponse) => void
  onDesativar: (produto: ProdutoResponse) => void
}

export function TabelaProdutos({
  produtos,
  selecionadoId,
  onSelecionar,
  onEditar,
  onAjustarEstoque,
  onDesativar,
}: TabelaProdutosProps) {
  const role = useAuthStore((s) => s.user?.role)
  const podeEditar = role === 'boss' || role === 'admin' || role === 'gerente'
  const podeDesativar = role === 'boss' || role === 'admin'
  const verCusto = role !== 'operador'

  const [coluna, setColuna] = useState<ColunaOrdenavel>('nome')
  const [direcao, setDirecao] = useState<Direcao>('asc')

  function alternarOrdem(col: ColunaOrdenavel) {
    if (coluna === col) {
      setDirecao(direcao === 'asc' ? 'desc' : 'asc')
    } else {
      setColuna(col)
      setDirecao('asc')
    }
  }

  const ordenados = [...produtos].sort((a, b) => {
    let cmp = 0
    switch (coluna) {
      case 'nome':
        cmp = a.nome.localeCompare(b.nome)
        break
      case 'categoria':
        cmp = (a.categoria ?? '').localeCompare(b.categoria ?? '')
        break
      case 'precoVenda':
        cmp = Number(a.precoVenda) - Number(b.precoVenda)
        break
      case 'estoqueAtual':
        cmp = a.estoqueAtual - b.estoqueAtual
        break
    }
    return direcao === 'asc' ? cmp : -cmp
  })

  function IconeOrdem({ col }: { col: ColunaOrdenavel }) {
    if (coluna !== col) return <ArrowUpDown size={14} className="text-muted-foreground/50" />
    return direcao === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  function HeaderOrdenavel({ col, children, className }: { col: ColunaOrdenavel; children: React.ReactNode; className?: string }) {
    return (
      <th className={cn('py-3 px-4 font-medium', className)}>
        <button
          onClick={() => alternarOrdem(col)}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          {children}
          <IconeOrdem col={col} />
        </button>
      </th>
    )
  }

  if (produtos.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">Nenhum produto encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="text-sm text-muted-foreground border-b border-border">
            <HeaderOrdenavel col="nome" className="text-left">Produto</HeaderOrdenavel>
            <HeaderOrdenavel col="categoria" className="text-left">Categoria</HeaderOrdenavel>
            <HeaderOrdenavel col="precoVenda" className="text-right">Preço Venda</HeaderOrdenavel>
            {verCusto && <th className="py-3 px-4 font-medium text-right text-sm text-muted-foreground">Preço Custo</th>}
            <HeaderOrdenavel col="estoqueAtual" className="text-center">Estoque</HeaderOrdenavel>
            <th className="py-3 px-4 font-medium text-center text-sm text-muted-foreground">Status</th>
            {podeEditar && <th className="py-3 px-4 font-medium text-center text-sm text-muted-foreground w-36">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {ordenados.map((produto, index) => {
            const estoqueBaixo = produto.estoqueAtual <= produto.estoqueMinimo
            const selecionado = produto.id === selecionadoId

            return (
              <tr
                key={produto.id}
                onClick={() => onSelecionar(produto.id)}
                onDoubleClick={() => podeEditar && onEditar(produto)}
                className={cn(
                  'transition-colors cursor-pointer',
                  selecionado ? 'bg-primary/5' : 'hover:bg-muted/50',
                  index > 0 && 'border-t border-border/50',
                )}
              >
                <td className="py-3 px-4">
                  <p className="font-medium text-base">
                    {produto.nome}
                    {produto.laboratorio && (
                      <span className="text-sm text-muted-foreground font-normal ml-2">— {produto.laboratorio}</span>
                    )}
                  </p>
                  {produto.codigoBarras && (
                    <p className="text-sm text-muted-foreground">{produto.codigoBarras}</p>
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {produto.categoria ?? '—'}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-medium">
                  {formatarMoeda(produto.precoVenda)}
                </td>
                {verCusto && (
                  <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                    {produto.precoCusto ? formatarMoeda(produto.precoCusto) : '—'}
                  </td>
                )}
                <td className="py-3 px-4 text-center">
                  <span className={cn(
                    'tabular-nums font-semibold',
                    estoqueBaixo ? 'text-warning' : 'text-foreground',
                  )}>
                    {produto.estoqueAtual}
                  </span>
                  {estoqueBaixo && (
                    <Badge variante="warning" className="ml-2">Baixo</Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {produto.ativo ? (
                    <Badge variante="success">Ativo</Badge>
                  ) : (
                    <Badge variante="muted">Inativo</Badge>
                  )}
                </td>
                {podeEditar && (
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditar(produto) }}
                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onAjustarEstoque(produto) }}
                        className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                        title="Ajustar estoque (F5)"
                      >
                        <PackagePlus size={16} />
                      </button>
                      {podeDesativar && produto.ativo && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDesativar(produto) }}
                          className="p-2 text-muted-foreground hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                          title="Desativar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
