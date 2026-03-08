# Sistema de Gestão para Farmácia — Contexto do Projeto

## Visão Geral

Estou construindo um sistema de gestão para farmácia pequena, com potencial de escalar para venda a outras farmácias. A farmácia não vende medicamentos controlados, então **não há necessidade de integração com SNGPC**.

O sistema será desktop (roda no computador da farmácia) com backend centralizado num VPS.

---

## Stack Tecnológica

### Frontend (Desktop)
- **Electron** — app desktop cross-platform
- **React + TypeScript** — React puro, sem framework (**Next.js está fora de cogitação**)
  - Se houver necessidade de framework no futuro: **Vinext** ou **TanStack Start** como alternativas
  - Para app desktop, React puro com Vite é suficiente e mais simples
- **Shadcn/UI** — componentes, **somente light theme**, sem dark mode
- **Tailwind CSS**
- **Vite** como bundler dentro do Electron
- **Gerenciador de pacotes: pnpm** (exigido pelo scaffold do Electron)

### Backend
- **Bun** — runtime e gerenciador de pacotes
- **TypeScript**
- **Fastify** como framework HTTP
- **PostgreSQL** como banco de dados
- **Drizzle ORM** — mais leve que Prisma, mais controle sobre o SQL
- Hospedado num **VPS próprio** com Nginx + PM2

### Autenticação
- **BetterAuth** — autenticação server-side, sessões seguras, controle de acesso por perfil

### Integrações
- **Focus NFe** ou **WebmaniaBR** para emissão de NFC-e (nota fiscal ao consumidor eletrônica)

---

## Estrutura do Projeto

**Não é monorepo.** Dois projetos independentes dentro da mesma pasta raiz (`PHarmacy/`), cada um com seu próprio `package.json`. Tipos compartilhados ficam em `shared/types`.

```
PHarmacy/
├── api/                  # Bun + Fastify + Drizzle
├── desktop/              # pnpm + Electron + React
├── shared/
│   └── types/            # Tipos TypeScript compartilhados entre api e desktop
└── PROJETO_FARMACIA.md
```

---

## Princípios de UX — Muito Importantes

O perfil de usuário é **leigo em tecnologia**, possivelmente com mais idade. A interface deve seguir rigorosamente:

- **Light theme apenas** — dark theme passa impressão de complexidade
- **Fonte mínima de 16px** — nunca menor
- **Botões grandes com texto descritivo** — nunca só ícone sem label
- **Fluxo de venda em tela única** — buscar produto, adicionar ao carrinho e finalizar sem sair da tela
- **Feedback visual exagerado** — toast de sucesso (verde) em tudo, erro em vermelho, sempre claro
- **Atalhos de teclado** no PDV:
  - `F2` → nova venda
  - `F10` → finalizar venda
  - `Enter` → buscar/adicionar produto
  - `Esc` → cancelar/voltar
- **Zero jargão técnico** na interface — "Finalizar Venda" não "Commit Transaction"

### Paleta de Cores
- Fundo: branco puro `#FFFFFF`
- Primária: azul `#0095DA` (remete a saúde/confiança)
- Sucesso/Confirmação: verde
- Erro/Cancelamento: vermelho
- Tipografia: Inter (já incluso no Shadcn)

---

## Roadmap de Desenvolvimento

### Fase 1 — MVP Core
1. **Cadastro de Produtos**
   - Nome, código de barras, preço de venda, preço de custo, unidade
   - Categoria
   - Estoque atual, estoque mínimo (alerta de ruptura)

2. **PDV (Ponto de Venda)**
   - Busca por código de barras ou nome
   - Carrinho de compras
   - Formas de pagamento: dinheiro, cartão débito, cartão crédito, PIX
   - Troco automático para pagamento em dinheiro
   - Impressão de cupom (não fiscal para início)

3. **Fechamento de Caixa**
   - Abertura com valor inicial
   - Resumo de vendas do dia por forma de pagamento
   - Fechamento com conferência

### Fase 2 — Fiscal
4. **NFC-e**
   - Emissão de nota fiscal ao consumidor via API (Focus NFe ou WebmaniaBR)
   - Reimpressão de nota
   - Cancelamento de nota

### Fase 3 — Gestão
5. **Relatórios**
   - Vendas por período
   - Produtos mais vendidos
   - Alertas de estoque mínimo

6. **Financeiro Básico**
   - Contas a pagar
   - Contas a receber
   - Fluxo de caixa

### Fase 4 — Multi-tenant (quando escalar)
- Preparar arquitetura para múltiplas farmácias
- Painel administrativo separado por cliente
- Isolamento de dados por tenant

---

## Modelo de Dados Inicial (Drizzle)

```ts
// src/infrastructure/db/schema.ts
import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

export const produtos = pgTable('produtos', {
  id:            uuid('id').defaultRandom().primaryKey(),
  tenantId:      uuid('tenant_id').notNull(),
  nome:          varchar('nome', { length: 255 }).notNull(),
  codigoBarras:  varchar('codigo_barras', { length: 50 }).unique(),
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
  status:          varchar('status', { length: 20 }).default('ABERTO').notNull(), // ABERTO, FECHADO
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
  status:         varchar('status', { length: 20 }).default('CONCLUIDA').notNull(), // CONCLUIDA, CANCELADA
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
```

---

## Arquitetura

Seguiremos **Clean Architecture** em toda a aplicação, especialmente na API.

### Camadas (de dentro pra fora)

```
Entities → Use Cases → Interface Adapters → Frameworks & Drivers
```

### Estrutura da API seguindo Clean Architecture

```
api/src/
├── domain/               # Entidades e regras de negócio puras (sem dependências externas)
│   ├── entities/         # Produto, Venda, Caixa...
│   └── errors/           # Erros de domínio (EstoqueInsuficienteError, etc.)
├── application/          # Casos de uso (Use Cases)
│   ├── use-cases/
│   │   ├── venda/
│   │   │   ├── CriarVendaUseCase.ts
│   │   │   └── CancelarVendaUseCase.ts
│   │   ├── produto/
│   │   │   ├── CadastrarProdutoUseCase.ts
│   │   │   └── BuscarProdutoUseCase.ts
│   │   └── caixa/
│   │       ├── AbrirCaixaUseCase.ts
│   │       └── FecharCaixaUseCase.ts
│   └── repositories/     # Interfaces dos repositórios (contratos)
│       ├── IProdutoRepository.ts
│       ├── IVendaRepository.ts
│       └── ICaixaRepository.ts
├── infrastructure/       # Implementações concretas (Drizzle, NFe, etc.)
│   ├── db/
│   │   └── schema.ts     # Schema Drizzle
│   ├── repositories/
│   │   ├── DrizzleProdutoRepository.ts
│   │   └── DrizzleVendaRepository.ts
│   └── services/
│       └── FocusNFeService.ts
└── presentation/         # Controllers e rotas do Fastify
    └── routes/
        ├── produto.routes.ts
        ├── venda.routes.ts
        └── caixa.routes.ts
```

### Regras
- **Domain** não importa nada externo — zero dependência de Drizzle, Fastify ou qualquer lib
- **Use Cases** dependem apenas de interfaces (repositórios), nunca de implementações concretas
- **Injeção de dependência** nos Use Cases via construtor
- Erros de domínio são classes próprias, nunca strings soltas

---

## Testes

- **Bun** como test runner — absurdamente mais rápido que Jest/Vitest
- **Docker** para banco de dados nos testes de integração — mais fiel ao ambiente real que banco em memória
- Estrutura:
  - **Testes unitários** nos Use Cases (domain puro, zero dependência externa, roda instantâneo)
  - **Testes de integração** nas rotas da API com Postgres rodando em Docker
  - Cada test suite sobe e derruba o container automaticamente via script
  - **Testes de integração cobrem todos os endpoints** — cenários de sucesso e erro, da request HTTP até o resultado final
  - **Coverage de 100%** exigido tanto para testes unitários quanto para testes de integração dos endpoints

```bash
# Scripts no package.json da api
bun test                          # todos os testes
bun test src/domain               # só unitários
bun test src/infrastructure       # só integração (requer Docker rodando)
```

---

## Impressora Térmica (PDV)

- Impressoras de farmácia pequena geralmente são térmicas e falam protocolo **ESC/POS**
- Lib recomendada: **escpos** ou **node-thermal-printer**
- O sistema deve funcionar **sem impressora** — erro de impressão nunca deve cancelar ou travar uma venda
- Fluxo: finaliza venda → tenta imprimir → se falhar, loga o erro silenciosamente e mostra opção de reimprimir

---

## Observações Importantes

- O app Electron **nunca acessa o banco diretamente** — sempre via API REST
- A API roda no VPS, o Electron consome via HTTPS
- Backup do Postgres via cron job diário no VPS
- O sistema deve funcionar mesmo sem impressora de cupom instalada (ignorar erro silenciosamente)
- Sempre validar estoque antes de finalizar venda
- Multi-tenant deve ser preparado desde o início com campo `tenantId` nas tabelas principais (mesmo que só tenha 1 tenant agora)

---

## Segurança — Prioridade Máxima

**Segurança é o item mais crítico do sistema.** Toda decisão de arquitetura, código e infraestrutura deve considerar segurança em primeiro lugar. Nunca sacrificar segurança por conveniência ou velocidade de desenvolvimento.

### Autenticação com BetterAuth
- **BetterAuth** como solução de autenticação — sessões server-side, não JWT no client
- Senhas com **bcrypt** (custo mínimo 12)
- **Bloqueio de conta** após N tentativas de login falhas (brute force protection)
- Sessões com **expiração automática** e renovação segura
- Logout invalida a sessão no servidor imediatamente
- Suporte a múltiplos perfis: `ADMIN`, `OPERADOR` (caixa), `GERENTE`

### Autorização (RBAC)
- Controle de acesso baseado em perfil (RBAC) em todas as rotas da API
- Cada rota valida se o perfil do usuário tem permissão para aquela ação
- Nunca confiar em dados vindos do client para determinar permissões

#### Perfis e Permissões

| Perfil | Quem é | Pode fazer | NÃO pode |
|---|---|---|---|
| **ADMIN** | Dono / Responsável técnico | Tudo — cadastros, relatórios, financeiro, configurações, gerenciar usuários | — |
| **GERENTE** | Gerente de loja | Cadastrar/editar produtos, ver relatórios, abrir/fechar caixa, cancelar vendas, ver financeiro | Gerenciar usuários, alterar configurações do sistema |
| **OPERADOR** | Atendente / Caixa | Abrir caixa, realizar vendas, buscar produtos, fechar o próprio caixa | Cadastrar/editar produtos, cancelar vendas, ver relatórios, ver financeiro, ver preço de custo |

#### Regras de negócio por perfil
- **Operador nunca vê preço de custo** — apenas preço de venda
- **Cancelamento de venda** exige perfil GERENTE ou ADMIN (prevenção de fraude)
- **Desconto acima de X%** requer aprovação de GERENTE (limite configurável)
- **Fechamento de caixa** — operador fecha o próprio, gerente pode fechar qualquer um

### Comunicação
- **HTTPS obrigatório** — nunca HTTP em produção, certificado via Certbot no VPS
- Electron se comunica com a API sempre via HTTPS
- **CORS** configurado explicitamente — nunca wildcard `*` em produção
- Headers de segurança via **Helmet** no Fastify (CSP, HSTS, X-Frame-Options, etc.)

### API
- **Rate limiting** em todas as rotas — especialmente nas de autenticação
- **Validação de input** rigorosa com Zod em todos os endpoints — nunca confiar em dados externos
- Nunca expor stack traces ou mensagens de erro internas ao client em produção
- Logs de auditoria para todas as ações críticas (login, venda, cancelamento, alteração de preço)
  - **Implementar junto com BetterAuth** — depende de `userId` real da sessão
  - Tabela `audit_logs`: `id`, `tenantId`, `userId`, `acao`, `entidade`, `entidadeId`, `detalhes` (JSON), `ip`, `createdAt`
  - Registrar: login/logout, CRUD produto, abertura/fechamento caixa, criação/cancelamento venda, alteração de preço
- Parâmetros de query e body sempre sanitizados antes de chegar no banco

### Banco de Dados
- Usuário do Postgres com **permissões mínimas** — apenas SELECT/INSERT/UPDATE/DELETE nas tabelas necessárias, nunca superuser
- Postgres **não exposto** para a internet — acesso apenas local no VPS
- **Soft delete** em vez de DELETE físico para registros críticos (vendas, produtos)
- Backup diário automático com retenção mínima de 30 dias

### Electron / Client
- **Context Isolation** habilitado no Electron — nunca `nodeIntegration: true`
- Comunicação entre renderer e main process apenas via `contextBridge` e IPC seguro
- Credenciais e tokens **nunca** armazenados em `localStorage` ou em texto puro
- Sessão encerrada automaticamente após período de inatividade

### Infraestrutura (VPS)
- Firewall configurado — apenas portas 80, 443 e SSH abertas
- SSH apenas com **chave pública** — senha desabilitada
- Atualizações de segurança do sistema operacional aplicadas regularmente
- Nginx como reverse proxy na frente da API — nunca expor a porta do Fastify diretamente
