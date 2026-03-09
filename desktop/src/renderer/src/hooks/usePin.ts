import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface PinStatus {
  temPin: boolean
}

/**
 * Hook para gerenciar PIN de confirmação.
 *
 * Uso:
 * ```
 * const { solicitarPin, ModalPinComponent } = usePin()
 *
 * async function handleDesativar() {
 *   const pin = await solicitarPin('Confirme para desativar o produto.')
 *   if (!pin) return // cancelou
 *   await api.delete('/api/produtos/123', { headers: { 'X-Pin': pin } })
 * }
 * ```
 */
export function usePin() {
  const queryClient = useQueryClient()

  // Status: o usuário tem PIN definido?
  const { data: pinStatus } = useQuery<PinStatus>({
    queryKey: ['pin-status'],
    queryFn: async () => {
      const { data } = await api.get<PinStatus>('/api/pin/status')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })

  // Mutation para definir PIN
  const definirPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      await api.post('/api/pin/definir', { pin })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pin-status'] })
    },
  })

  // Mutation para verificar PIN
  const verificarPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      await api.post('/api/pin/verificar', { pin })
      return pin
    },
  })

  // Estado do modal
  const [modalState, setModalState] = useState<{
    tipo: 'verificar' | 'definir' | null
    mensagem: string
    resolve: ((pin: string | null) => void) | null
    erro: string
  }>({
    tipo: null,
    mensagem: '',
    resolve: null,
    erro: '',
  })

  /**
   * Solicita o PIN ao usuário.
   * Se o usuário não tem PIN, abre o modal para definir primeiro.
   * Retorna o PIN validado ou null se cancelou.
   */
  const solicitarPin = useCallback((mensagem = 'Digite seu PIN para confirmar.'): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!pinStatus?.temPin) {
        // Precisa definir PIN primeiro
        setModalState({
          tipo: 'definir',
          mensagem,
          resolve,
          erro: '',
        })
      } else {
        setModalState({
          tipo: 'verificar',
          mensagem,
          resolve,
          erro: '',
        })
      }
    })
  }, [pinStatus?.temPin])

  const handleConfirmarDefinir = useCallback(async (pin: string) => {
    try {
      await definirPinMutation.mutateAsync(pin)
      // Agora que definiu, pede para verificar
      setModalState((prev) => ({
        ...prev,
        tipo: 'verificar',
        erro: '',
      }))
    } catch {
      setModalState((prev) => ({
        ...prev,
        erro: 'Erro ao definir PIN. Tente novamente.',
      }))
    }
  }, [definirPinMutation])

  const handleConfirmarVerificar = useCallback(async (pin: string) => {
    try {
      await verificarPinMutation.mutateAsync(pin)
      const resolve = modalState.resolve
      setModalState({ tipo: null, mensagem: '', resolve: null, erro: '' })
      resolve?.(pin)
    } catch {
      setModalState((prev) => ({
        ...prev,
        erro: 'PIN incorreto. Tente novamente.',
      }))
    }
  }, [verificarPinMutation, modalState.resolve])

  const handleCancelar = useCallback(() => {
    const resolve = modalState.resolve
    setModalState({ tipo: null, mensagem: '', resolve: null, erro: '' })
    resolve?.(null)
  }, [modalState.resolve])

  return {
    temPin: pinStatus?.temPin ?? false,
    solicitarPin,
    modalState: {
      tipo: modalState.tipo,
      mensagem: modalState.mensagem,
      erro: modalState.erro,
      carregando: definirPinMutation.isPending || verificarPinMutation.isPending,
      onConfirmarDefinir: handleConfirmarDefinir,
      onConfirmarVerificar: handleConfirmarVerificar,
      onCancelar: handleCancelar,
    },
  }
}
