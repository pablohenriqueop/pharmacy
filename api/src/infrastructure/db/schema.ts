import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
  text,
  jsonb,
} from 'drizzle-orm/pg-core'

// ==================== BetterAuth Tables ====================

export const user = pgTable('user', {
  id:             text('id').primaryKey(),
  name:           text('name').notNull(),
  email:          text('email').notNull().unique(),
  emailVerified:  boolean('email_verified').notNull(),
  image:          text('image'),
  role:           text('role'),
  banned:         boolean('banned').default(false),
  banReason:      text('ban_reason'),
  banExpires:     timestamp('ban_expires'),
  tenantId:       uuid('tenant_id').notNull(),
  createdAt:      timestamp('created_at').notNull(),
  updatedAt:      timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id:              text('id').primaryKey(),
  userId:          text('user_id').notNull().references(() => user.id),
  token:           text('token').notNull().unique(),
  expiresAt:       timestamp('expires_at').notNull(),
  ipAddress:       text('ip_address'),
  userAgent:       text('user_agent'),
  impersonatedBy:  text('impersonated_by'),
  createdAt:       timestamp('created_at').notNull(),
  updatedAt:       timestamp('updated_at').notNull(),
})

export const account = pgTable('account', {
  id:                      text('id').primaryKey(),
  userId:                  text('user_id').notNull().references(() => user.id),
  accountId:               text('account_id').notNull(),
  providerId:              text('provider_id').notNull(),
  accessToken:             text('access_token'),
  refreshToken:            text('refresh_token'),
  accessTokenExpiresAt:    timestamp('access_token_expires_at'),
  refreshTokenExpiresAt:   timestamp('refresh_token_expires_at'),
  scope:                   text('scope'),
  idToken:                 text('id_token'),
  password:                text('password'),
  createdAt:               timestamp('created_at').notNull(),
  updatedAt:               timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at'),
  updatedAt:  timestamp('updated_at'),
})

// ==================== Audit Log ====================

export const auditLogs = pgTable('audit_logs', {
  id:          uuid('id').defaultRandom().primaryKey(),
  tenantId:    uuid('tenant_id').notNull(),
  userId:      text('user_id').notNull().references(() => user.id),
  acao:        varchar('acao', { length: 50 }).notNull(),
  entidade:    varchar('entidade', { length: 50 }).notNull(),
  entidadeId:  varchar('entidade_id', { length: 100 }),
  detalhes:    jsonb('detalhes'),
  ip:          varchar('ip', { length: 45 }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

// ==================== Business Tables ====================

export const produtos = pgTable('produtos', {
  id:            uuid('id').defaultRandom().primaryKey(),
  tenantId:      uuid('tenant_id').notNull(),
  nome:          varchar('nome', { length: 255 }).notNull(),
  codigoBarras:  varchar('codigo_barras', { length: 50 }),
  categoria:     varchar('categoria', { length: 100 }),
  precoVenda:    numeric('preco_venda', { precision: 10, scale: 2 }).notNull(),
  precoCusto:    numeric('preco_custo', { precision: 10, scale: 2 }),
  unidade:       varchar('unidade', { length: 10 }).default('UN').notNull(),
  estoqueAtual:  integer('estoque_atual').default(0).notNull(),
  estoqueMinimo: integer('estoque_minimo').default(5).notNull(),
  ativo:         boolean('ativo').default(true).notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
})

export const caixas = pgTable('caixas', {
  id:              uuid('id').defaultRandom().primaryKey(),
  tenantId:        uuid('tenant_id').notNull(),
  valorAbertura:   numeric('valor_abertura', { precision: 10, scale: 2 }).notNull(),
  valorFechamento: numeric('valor_fechamento', { precision: 10, scale: 2 }),
  aberturaEm:      timestamp('abertura_em').defaultNow().notNull(),
  fechamentoEm:    timestamp('fechamento_em'),
  status:          varchar('status', { length: 20 }).default('ABERTO').notNull(),
})

export const vendas = pgTable('vendas', {
  id:             uuid('id').defaultRandom().primaryKey(),
  tenantId:       uuid('tenant_id').notNull(),
  caixaId:        uuid('caixa_id').notNull().references(() => caixas.id),
  total:          numeric('total', { precision: 10, scale: 2 }).notNull(),
  desconto:       numeric('desconto', { precision: 10, scale: 2 }).default('0').notNull(),
  formaPagamento: varchar('forma_pagamento', { length: 20 }).notNull(),
  valorPago:      numeric('valor_pago', { precision: 10, scale: 2 }),
  troco:          numeric('troco', { precision: 10, scale: 2 }),
  status:         varchar('status', { length: 20 }).default('CONCLUIDA').notNull(),
  nfceChave:      varchar('nfce_chave', { length: 50 }),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
})

export const itensVenda = pgTable('itens_venda', {
  id:         uuid('id').defaultRandom().primaryKey(),
  vendaId:    uuid('venda_id').notNull().references(() => vendas.id),
  produtoId:  uuid('produto_id').notNull().references(() => produtos.id),
  quantidade: integer('quantidade').notNull(),
  precoUnit:  numeric('preco_unit', { precision: 10, scale: 2 }).notNull(),
  subtotal:   numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
})

export const nfce = pgTable('nfce', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  tenantId:            uuid('tenant_id').notNull(),
  vendaId:             uuid('venda_id').notNull().references(() => vendas.id),
  chave:               varchar('chave', { length: 44 }).notNull(),
  numero:              integer('numero').notNull(),
  serie:               integer('serie').notNull(),
  xml:                 text('xml').notNull(),
  protocolo:           varchar('protocolo', { length: 50 }).notNull(),
  status:              varchar('status', { length: 20 }).default('AUTORIZADA').notNull(),
  motivoCancelamento:  text('motivo_cancelamento'),
  createdAt:           timestamp('created_at').defaultNow().notNull(),
})

export const configuracoes = pgTable('configuracoes', {
  id:             uuid('id').defaultRandom().primaryKey(),
  tenantId:       uuid('tenant_id').notNull().unique(),
  nomeFarmacia:   varchar('nome_farmacia', { length: 255 }).notNull(),
  corPrimaria:    varchar('cor_primaria', { length: 7 }).default('#0095DA').notNull(),
  corSecundaria:  varchar('cor_secundaria', { length: 7 }).default('#FFFFFF').notNull(),
  logoUrl:        text('logo_url'),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
})

export const contas = pgTable('contas', {
  id:              uuid('id').defaultRandom().primaryKey(),
  tenantId:        uuid('tenant_id').notNull(),
  tipo:            varchar('tipo', { length: 10 }).notNull(), // PAGAR, RECEBER
  descricao:       varchar('descricao', { length: 255 }).notNull(),
  valor:           numeric('valor', { precision: 10, scale: 2 }).notNull(),
  categoria:       varchar('categoria', { length: 100 }),
  dataVencimento:  timestamp('data_vencimento').notNull(),
  dataPagamento:   timestamp('data_pagamento'),
  status:          varchar('status', { length: 20 }).default('PENDENTE').notNull(), // PENDENTE, PAGA, CANCELADA
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
})
