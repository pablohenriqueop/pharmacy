import { useEffect } from 'react'

type AtalhoMap = Record<string, () => void>

// Mapeia e.code → chave do atalho (para teclas que variam entre layouts)
const CODE_MAP: Record<string, string> = {
  Slash: '/',
  NumpadDivide: '/',
}

export function useAtalhos(atalhos: AtalhoMap) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Tenta match por e.key primeiro, depois por e.code
      const key = atalhos[e.key] ? e.key : (CODE_MAP[e.code] && atalhos[CODE_MAP[e.code]] ? CODE_MAP[e.code] : null)

      if (!key) return

      const callback = atalhos[key]!
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      // F-keys e Escape sempre funcionam
      if (key.startsWith('F') || key === 'Escape') {
        e.preventDefault()
        callback()
        return
      }

      // '/' sempre funciona (foca busca — previne digitação)
      if (key === '/') {
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

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [atalhos])
}
