export interface ConfiguracaoProps {
  id: string
  tenantId: string
  nomeFarmacia: string
  corPrimaria: string
  corSecundaria: string
  logoUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AtualizarConfiguracaoInput {
  tenantId: string
  nomeFarmacia: string
  corPrimaria?: string
  corSecundaria?: string
  logoUrl?: string | null
}

export class Configuracao {
  constructor(public readonly props: ConfiguracaoProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get nomeFarmacia() { return this.props.nomeFarmacia }
  get corPrimaria() { return this.props.corPrimaria }
  get corSecundaria() { return this.props.corSecundaria }
  get logoUrl() { return this.props.logoUrl }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
}
