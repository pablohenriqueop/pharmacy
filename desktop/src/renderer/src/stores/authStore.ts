import { create } from 'zustand'
import type { SessionUser } from '@shared/auth'

interface AuthState {
  user: SessionUser | null
  setUser: (user: SessionUser | null) => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: () => get().user !== null,
}))
