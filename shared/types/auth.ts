export type Role = 'boss' | 'admin' | 'gerente' | 'operador'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  tenantId: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: SessionUser
  token: string
}
