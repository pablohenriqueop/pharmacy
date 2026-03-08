import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from '@/infrastructure/db/connection.ts'
import * as schema from '@/infrastructure/db/schema.ts'
import { ac, adminRole, gerenteRole, operadorRole } from './permissions.ts'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      tenantId: {
        type: 'string',
        required: true,
        input: true,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'operador',
      adminRoles: ['admin'],
      ac,
      roles: {
        admin: adminRole,
        gerente: gerenteRole,
        operador: operadorRole,
      },
    }),
  ],
  trustedOrigins: process.env.CORS_ORIGIN?.split(',') ?? [],
})
