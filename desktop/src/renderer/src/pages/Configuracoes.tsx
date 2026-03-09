import { useState, useEffect } from 'react'
import { Settings, Save, Palette } from 'lucide-react'
import { useConfiguracao, useAtualizarConfiguracao } from '@/hooks/useConfiguracoes'
import { useFeedbackStore } from '@/stores/feedbackStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

export function Configuracoes() {
  const role = useAuthStore((s) => s.user?.role)
  const podeEditar = role === 'boss'
  const feedback = useFeedbackStore((s) => s.show)

  const { data: config, isLoading } = useConfiguracao()
  const atualizarConfig = useAtualizarConfiguracao()

  const [nomeFarmacia, setNomeFarmacia] = useState('')
  const [corPrimaria, setCorPrimaria] = useState('#0095DA')
  const [corSecundaria, setCorSecundaria] = useState('#FFFFFF')
  const [alterado, setAlterado] = useState(false)

  useEffect(() => {
    if (config) {
      setNomeFarmacia(config.nomeFarmacia)
      setCorPrimaria(config.corPrimaria)
      setCorSecundaria(config.corSecundaria)
      setAlterado(false)
    }
  }, [config])

  function handleChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      setAlterado(true)
    }
  }

  async function handleSalvar() {
    if (!nomeFarmacia.trim()) {
      feedback('error', 'Nome da farmácia é obrigatório.')
      return
    }
    try {
      await atualizarConfig.mutateAsync({
        nomeFarmacia: nomeFarmacia.trim(),
        corPrimaria,
        corSecundaria,
      })
      feedback('success', 'Configurações salvas com sucesso!')
      setAlterado(false)
    } catch {
      feedback('error', 'Erro ao salvar configurações.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-primary" />
        <h2 className="text-2xl font-bold">Configurações</h2>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* White-label */}
        <div className="bg-white rounded-xl border border-border shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Identidade Visual</h3>
              <p className="text-sm text-muted-foreground">
                Personalize o nome e as cores da sua farmácia.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome da Farmácia *</label>
              <input
                value={nomeFarmacia}
                onChange={handleChange(setNomeFarmacia)}
                disabled={!podeEditar}
                className={cn(
                  'w-full h-12 px-4 rounded-lg border border-border bg-white text-base transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  !podeEditar && 'opacity-60 cursor-not-allowed',
                )}
                placeholder="Ex: Farmatem"
              />
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={corPrimaria}
                    onChange={handleChange(setCorPrimaria)}
                    disabled={!podeEditar}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    value={corPrimaria}
                    onChange={handleChange(setCorPrimaria)}
                    disabled={!podeEditar}
                    className={cn(
                      'flex-1 h-12 px-4 rounded-lg border border-border bg-white text-base font-mono',
                      'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      !podeEditar && 'opacity-60 cursor-not-allowed',
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Cor Secundária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={corSecundaria}
                    onChange={handleChange(setCorSecundaria)}
                    disabled={!podeEditar}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    value={corSecundaria}
                    onChange={handleChange(setCorSecundaria)}
                    disabled={!podeEditar}
                    className={cn(
                      'flex-1 h-12 px-4 rounded-lg border border-border bg-white text-base font-mono',
                      'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      !podeEditar && 'opacity-60 cursor-not-allowed',
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">Pré-visualização</p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: corPrimaria, color: corSecundaria }}
                >
                  {nomeFarmacia.charAt(0) || 'F'}
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: corPrimaria }}>
                    {nomeFarmacia || 'Nome da Farmácia'}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão salvar */}
            {podeEditar && (
              <button
                onClick={handleSalvar}
                disabled={!alterado || atualizarConfig.isPending}
                className={cn(
                  'flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold text-white transition-all',
                  alterado && !atualizarConfig.isPending
                    ? 'bg-primary hover:bg-primary/90 shadow-md'
                    : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
              >
                <Save size={18} />
                {atualizarConfig.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}

            {!podeEditar && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Apenas o administrador principal pode alterar as configurações.
              </p>
            )}
          </div>
        </div>

        {/* Info do sistema */}
        <div className="bg-white rounded-xl border border-border shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Informações do Sistema</h3>
          <div className="space-y-3">
            <InfoRow label="Versão" valor="0.1.0" />
            <InfoRow label="ID do Tenant" valor={config?.tenantId ?? '—'} />
            <InfoRow
              label="Criado em"
              valor={
                config?.createdAt
                  ? new Date(config.createdAt).toLocaleDateString('pt-BR')
                  : '—'
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium font-mono">{valor}</span>
    </div>
  )
}
