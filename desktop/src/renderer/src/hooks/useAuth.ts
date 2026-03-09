import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest, LoginResponse, SessionUser } from '@shared/auth'

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  const sessao = useQuery<SessionUser | null>({
    queryKey: ['sessao'],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ user: SessionUser }>('/api/auth/get-session')
        setUser(data.user)
        return data.user
      } catch {
        setUser(null)
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const login = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (input) => {
      const { data } = await api.post<LoginResponse>('/api/auth/sign-in/email', {
        email: input.email,
        password: input.password,
      })
      return data
    },
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.setQueryData(['sessao'], data.user)
    },
  })

  const logout = useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post('/api/auth/sign-out')
    },
    onSuccess: () => {
      setUser(null)
      queryClient.setQueryData(['sessao'], null)
      queryClient.clear()
    },
  })

  return { sessao, login, logout }
}
