import { useEffect } from 'react'

type AtalhoMap = Record<string, () => void>

export function useAtalhos(atalhos: AtalhoMap) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const key = e.key
      const callback = atalhos[key]

      if (callback) {
        // Não intercepta se estiver num input e a tecla for Enter/Esc
        const target = e.target as HTMLElement
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

        // F-keys sempre funcionam
        if (key.startsWith('F')) {
          e.preventDefault()
          callback()
          return
        }

        // Escape sempre funciona
        if (key === 'Escape') {
          e.preventDefault()
          callback()
          return
        }

        // Outras teclas só se não estiver num input
        if (!isInput) {
          e.preventDefault()
          callback()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [atalhos])
}
