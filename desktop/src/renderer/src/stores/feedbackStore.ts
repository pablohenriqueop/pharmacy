import { create } from 'zustand'

type FeedbackTipo = 'success' | 'error' | 'info'

interface FeedbackState {
  aberto: boolean
  tipo: FeedbackTipo
  mensagem: string
  show: (tipo: FeedbackTipo, mensagem: string) => void
  fechar: () => void
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  aberto: false,
  tipo: 'success',
  mensagem: '',

  show: (tipo, mensagem) => {
    set({ aberto: true, tipo, mensagem })
  },

  fechar: () => {
    set({ aberto: false })
  },
}))
