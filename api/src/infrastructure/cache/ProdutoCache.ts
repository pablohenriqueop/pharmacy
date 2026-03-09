import type { Produto } from '@/domain/entities/Produto.ts'
import type { IProdutoRepository } from '@/application/repositories/IProdutoRepository.ts'

interface CacheEntry {
  produtos: Produto[]
  timestamp: number
}

const TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Cache em memória do catálogo de produtos por tenant.
 * Farmácia pequena tem ~500-2000 produtos — cabe fácil em memória.
 * Invalidado manualmente ao criar/atualizar produto ou após TTL.
 */
class ProdutoCacheManager {
  private cache = new Map<string, CacheEntry>()

  async getCatalogo(tenantId: string, repo: IProdutoRepository): Promise<Produto[]> {
    const entry = this.cache.get(tenantId)
    const agora = Date.now()

    if (entry && agora - entry.timestamp < TTL) {
      return entry.produtos
    }

    const produtos = await repo.listarTodos(tenantId, { ativo: true })
    this.cache.set(tenantId, { produtos, timestamp: agora })
    return produtos
  }

  invalidar(tenantId: string): void {
    this.cache.delete(tenantId)
  }

  invalidarTodos(): void {
    this.cache.clear()
  }
}

export const produtoCache = new ProdutoCacheManager()
