import { useEffect } from 'react'
import { useGet } from './useApi'
import type { ConfiguracaoResponse } from '@shared/configuracao'

export function useConfig() {
  const query = useGet<ConfiguracaoResponse>(
    ['configuracao'],
    '/api/configuracoes',
  )

  useEffect(() => {
    if (!query.data) return

    document.title = query.data.nomeFarmacia

    const root = document.documentElement
    root.style.setProperty('--color-primary', query.data.corPrimaria)
    if (query.data.corSecundaria) {
      root.style.setProperty('--color-secondary', query.data.corSecundaria)
    }
  }, [query.data])

  return query
}
