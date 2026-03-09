export interface CategoriaProps {
  id: string
  tenantId: string
  nome: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CriarCategoriaInput {
  tenantId: string
  nome: string
}

export interface AtualizarCategoriaInput {
  nome?: string
  ativo?: boolean
}

export class Categoria {
  constructor(public readonly props: CategoriaProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get nome() { return this.props.nome }
  get ativo() { return this.props.ativo }
}
