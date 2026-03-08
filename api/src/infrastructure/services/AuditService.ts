import { db } from '@/infrastructure/db/connection.ts'
import { auditLogs } from '@/infrastructure/db/schema.ts'

export interface AuditEntry {
  tenantId: string
  userId: string
  acao: string
  entidade: string
  entidadeId?: string
  detalhes?: Record<string, unknown>
  ip?: string
}

export class AuditService {
  async registrar(entry: AuditEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        tenantId: entry.tenantId,
        userId: entry.userId,
        acao: entry.acao,
        entidade: entry.entidade,
        entidadeId: entry.entidadeId ?? null,
        detalhes: entry.detalhes ?? null,
        ip: entry.ip ?? null,
      })
    } catch (err) {
      // Auditoria nunca deve derrubar uma operação
      console.error('Falha ao registrar audit log:', err)
    }
  }
}

export const auditService = new AuditService()
