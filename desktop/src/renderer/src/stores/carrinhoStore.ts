import { create } from 'zustand'

export interface ItemCarrinho {
  produtoId: string
  nome: string
  codigoBarras: string | null
  laboratorio: string | null
  precoUnit: number
  quantidade: number
  subtotal: number
}

interface CarrinhoState {
  itens: ItemCarrinho[]
  desconto: number

  adicionarItem: (produto: { id: string; nome: string; codigoBarras: string | null; laboratorio: string | null; precoVenda: number }, quantidade?: number) => void
  removerItem: (produtoId: string) => void
  alterarQuantidade: (produtoId: string, quantidade: number) => void
  setDesconto: (valor: number) => void
  limpar: () => void

  totalBruto: () => number
  totalLiquido: () => number
  totalItens: () => number
}

export const useCarrinhoStore = create<CarrinhoState>((set, get) => ({
  itens: [],
  desconto: 0,

  adicionarItem: (produto, quantidade = 1) => {
    set((state) => {
      const existente = state.itens.find((i) => i.produtoId === produto.id)

      if (existente) {
        return {
          itens: state.itens.map((i) =>
            i.produtoId === produto.id
              ? {
                  ...i,
                  quantidade: i.quantidade + quantidade,
                  subtotal: (i.quantidade + quantidade) * i.precoUnit,
                }
              : i,
          ),
        }
      }

      return {
        itens: [
          ...state.itens,
          {
            produtoId: produto.id,
            nome: produto.nome,
            codigoBarras: produto.codigoBarras,
            laboratorio: produto.laboratorio,
            precoUnit: produto.precoVenda,
            quantidade,
            subtotal: produto.precoVenda * quantidade,
          },
        ],
      }
    })
  },

  removerItem: (produtoId) => {
    set((state) => ({
      itens: state.itens.filter((i) => i.produtoId !== produtoId),
    }))
  },

  alterarQuantidade: (produtoId, quantidade) => {
    if (quantidade <= 0) {
      get().removerItem(produtoId)
      return
    }
    set((state) => ({
      itens: state.itens.map((i) =>
        i.produtoId === produtoId
          ? { ...i, quantidade, subtotal: i.precoUnit * quantidade }
          : i,
      ),
    }))
  },

  setDesconto: (valor) => set({ desconto: Math.max(0, valor) }),

  limpar: () => set({ itens: [], desconto: 0 }),

  totalBruto: () => get().itens.reduce((acc, i) => acc + i.subtotal, 0),

  totalLiquido: () => Math.max(0, get().totalBruto() - get().desconto),

  totalItens: () => get().itens.reduce((acc, i) => acc + i.quantidade, 0),
}))
