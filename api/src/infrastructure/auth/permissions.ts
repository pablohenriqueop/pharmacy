import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

const statements = {
  ...defaultStatements,
  produto:    ['create', 'read', 'update', 'delete', 'read-custo'],
  venda:      ['create', 'read', 'cancel'],
  caixa:      ['open', 'close', 'close-any', 'read'],
  relatorio:  ['read'],
  financeiro: ['read'],
  nfce:       ['emit', 'cancel', 'read'],
  configuracao: ['read', 'update'],
} as const

export const ac = createAccessControl(statements)

// Boss — coringa, acesso total a tudo (exclusivo pablohenriqueop@gmail.com)
export const bossRole = ac.newRole({
  ...adminAc.statements,
  produto:    ['create', 'read', 'update', 'delete', 'read-custo'],
  venda:      ['create', 'read', 'cancel'],
  caixa:      ['open', 'close', 'close-any', 'read'],
  relatorio:  ['read'],
  financeiro: ['read'],
  nfce:       ['emit', 'cancel', 'read'],
  configuracao: ['read', 'update'],
})

// Admin — dono/responsável técnico da farmácia
export const adminRole = ac.newRole({
  ...adminAc.statements,
  produto:    ['create', 'read', 'update', 'delete', 'read-custo'],
  venda:      ['create', 'read', 'cancel'],
  caixa:      ['open', 'close', 'close-any', 'read'],
  relatorio:  ['read'],
  financeiro: ['read'],
  nfce:       ['emit', 'cancel', 'read'],
  configuracao: ['read'],
})

export const gerenteRole = ac.newRole({
  user:       ['list', 'get'],
  session:    ['list'],
  produto:    ['create', 'read', 'update', 'read-custo'],
  venda:      ['create', 'read', 'cancel'],
  caixa:      ['open', 'close', 'close-any', 'read'],
  relatorio:  ['read'],
  financeiro: ['read'],
  nfce:       ['emit', 'cancel', 'read'],
  configuracao: ['read'],
})

export const operadorRole = ac.newRole({
  produto:    ['read'],
  venda:      ['create', 'read'],
  caixa:      ['open', 'close', 'read'],
  nfce:       ['read'],
  configuracao: ['read'],
})

export const roles = {
  boss: bossRole,
  admin: adminRole,
  gerente: gerenteRole,
  operador: operadorRole,
} as const

export type Role = keyof typeof roles
