import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Plus } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { InputMoeda } from '@/components/ui/InputMoeda'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useCategorias, useCriarCategoria } from '@/hooks/useCategorias'
import type { ProdutoResponse } from '@shared/produto'

const produtoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  codigoBarras: z.string().optional().or(z.literal('')),
  categoriaId: z.string().optional().or(z.literal('')),
  laboratorio: z.string().optional().or(z.literal('')),
  unidade: z.string().min(1),
  estoqueAtual: z.number().int().min(0, 'Estoque não pode ser negativo'),
  estoqueMinimo: z.number().int().min(0, 'Estoque mínimo não pode ser negativo'),
})

type ProdutoFormData = z.infer<typeof produtoSchema>

interface DrawerProdutoProps {
  aberto: boolean
  produto: ProdutoResponse | null // null = criando novo
  onFechar: () => void
  onSalvar: (data: ProdutoFormData & { precoVenda: number; precoCusto?: number; categoria?: string }) => Promise<void>
  carregando: boolean
}

const UNIDADES = [
  { valor: 'UN', label: 'Unidade (UN)' },
  { valor: 'CX', label: 'Caixa (CX)' },
  { valor: 'ML', label: 'Mililitro (ML)' },
  { valor: 'L', label: 'Litro (L)' },
  { valor: 'G', label: 'Grama (G)' },
  { valor: 'KG', label: 'Quilograma (KG)' },
]

export function DrawerProduto({ aberto, produto, onFechar, onSalvar, carregando }: DrawerProdutoProps) {
  const role = useAuthStore((s) => s.user?.role)
  const verCusto = role !== 'operador'
  const editando = !!produto

  const { data: categorias } = useCategorias(true)
  const criarCategoria = useCriarCategoria()

  const [novaCategoria, setNovaCategoria] = useState('')
  const [criandoCategoria, setCriandoCategoria] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: '',
      codigoBarras: '',
      categoriaId: '',
      laboratorio: '',
      unidade: 'UN',
      estoqueAtual: 0,
      estoqueMinimo: 5,
    },
  })

  const categoriaIdAtual = watch('categoriaId')

  // Estado dos campos de moeda (fora do react-hook-form)
  const [precoVenda, setPrecoVenda] = useState(0)
  const [precoCusto, setPrecoCusto] = useState(0)

  useEffect(() => {
    if (aberto) {
      setCriandoCategoria(false)
      setNovaCategoria('')

      if (produto) {
        // Encontrar a categoria pelo nome para pegar o ID
        const categoriaMatch = categorias?.find(c => c.nome === produto.categoria)
        reset({
          nome: produto.nome,
          codigoBarras: produto.codigoBarras ?? '',
          categoriaId: categoriaMatch?.id ?? '',
          laboratorio: produto.laboratorio ?? '',
          unidade: produto.unidade,
          estoqueAtual: produto.estoqueAtual,
          estoqueMinimo: produto.estoqueMinimo,
        })
        setPrecoVenda(Number(produto.precoVenda))
        setPrecoCusto(produto.precoCusto ? Number(produto.precoCusto) : 0)
      } else {
        reset({
          nome: '',
          codigoBarras: '',
          categoriaId: '',
          laboratorio: '',
          unidade: 'UN',
          estoqueAtual: 0,
          estoqueMinimo: 5,
        })
        setPrecoVenda(0)
        setPrecoCusto(0)
      }
    }
  }, [aberto, produto, reset, categorias])

  // Ctrl+S para salvar
  useEffect(() => {
    if (!aberto) return
    function handler(e: KeyboardEvent) {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        document.getElementById('btn-salvar-produto')?.click()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [aberto])

  async function handleCriarCategoria() {
    const nome = novaCategoria.trim()
    if (!nome) return
    try {
      const nova = await criarCategoria.mutateAsync({ nome })
      setValue('categoriaId', nova.id)
      setCriandoCategoria(false)
      setNovaCategoria('')
    } catch {
      // erro tratado pelo mutation
    }
  }

  async function onSubmit(data: ProdutoFormData) {
    if (precoVenda <= 0) return

    // Resolve o nome da categoria pelo ID selecionado
    const categoriaSelecionada = categorias?.find(c => c.id === data.categoriaId)

    await onSalvar({
      ...data,
      codigoBarras: data.codigoBarras || undefined,
      categoria: categoriaSelecionada?.nome || undefined,
      laboratorio: data.laboratorio || undefined,
      precoVenda,
      precoCusto: precoCusto > 0 ? precoCusto : undefined,
    })
  }

  return (
    <Drawer
      aberto={aberto}
      onFechar={onFechar}
      titulo={editando ? 'Editar Produto' : 'Novo Produto'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nome */}
        <Campo label="Nome *" erro={errors.nome?.message}>
          <input
            {...register('nome')}
            className={inputClass(!!errors.nome)}
            placeholder="Ex: Dipirona 500mg"
          />
        </Campo>

        {/* Código de Barras */}
        <Campo label="Código de Barras">
          <input
            {...register('codigoBarras')}
            className={inputClass(false)}
            placeholder="Ex: 7891234560010"
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          {/* Categoria — select */}
          <Campo label="Categoria">
            {criandoCategoria ? (
              <div className="flex gap-2">
                <input
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className={inputClass(false)}
                  placeholder="Nome da categoria"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCriarCategoria()
                    }
                    if (e.key === 'Escape') {
                      setCriandoCategoria(false)
                      setNovaCategoria('')
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCriarCategoria}
                  disabled={criarCategoria.isPending || !novaCategoria.trim()}
                  className="px-3 h-12 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
                >
                  {criarCategoria.isPending ? '...' : 'OK'}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  {...register('categoriaId')}
                  className={inputClass(false)}
                >
                  <option value="">Sem categoria</option>
                  {categorias?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCriandoCategoria(true)}
                  className="p-3 h-12 rounded-lg border border-border hover:bg-muted transition-colors shrink-0"
                  title="Nova categoria"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </Campo>

          {/* Laboratório */}
          <Campo label="Laboratório">
            <input
              {...register('laboratorio')}
              className={inputClass(false)}
              placeholder="Ex: Medley"
            />
          </Campo>
        </div>

        {/* Preços */}
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Preço de Venda *" erro={precoVenda <= 0 ? 'Informe o preço' : undefined}>
            <InputMoeda value={precoVenda} onChange={setPrecoVenda} placeholder="0,00" />
          </Campo>

          {verCusto && (
            <Campo label="Preço de Custo">
              <InputMoeda value={precoCusto} onChange={setPrecoCusto} placeholder="0,00" />
            </Campo>
          )}
        </div>

        {/* Unidade */}
        <Campo label="Unidade">
          <select {...register('unidade')} className={inputClass(false)}>
            {UNIDADES.map((u) => (
              <option key={u.valor} value={u.valor}>{u.label}</option>
            ))}
          </select>
        </Campo>

        {/* Estoque */}
        <div className="grid grid-cols-2 gap-4">
          <Campo label={editando ? 'Estoque Atual' : 'Estoque Inicial'} erro={errors.estoqueAtual?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register('estoqueAtual', { valueAsNumber: true })}
              className={inputClass(!!errors.estoqueAtual)}
            />
          </Campo>
          <Campo label="Estoque Mínimo" erro={errors.estoqueMinimo?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register('estoqueMinimo', { valueAsNumber: true })}
              className={inputClass(!!errors.estoqueMinimo)}
            />
          </Campo>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-salvar-produto"
            type="submit"
            disabled={carregando}
            className={cn(
              'flex-1 h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all',
              carregando
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg',
            )}
          >
            <Save size={18} />
            {carregando ? 'Salvando...' : 'Salvar (Ctrl+S)'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}

// ─── Helpers ────────────────────────────────────────────────────

function inputClass(erro: boolean) {
  return cn(
    'w-full h-12 px-4 rounded-lg border bg-white text-base transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
    erro ? 'border-error' : 'border-border',
  )
}

function Campo({ label, erro, children }: { label: string; erro?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {erro && <p className="text-sm text-error mt-1">{erro}</p>}
    </div>
  )
}
