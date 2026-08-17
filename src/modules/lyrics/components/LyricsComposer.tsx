import { Check, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { LyricsTextService } from '../services/LyricsTextService'

export function LyricsComposer({
  trackId,
  initial = '',
  onSaved,
  onCancel,
}: {
  trackId: string
  initial?: string
  onSaved: (lyrics: string) => void
  onCancel?: () => void
}) {
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const lyrics = draft.replace(/\r\n/g, '\n').trim()
    if (!lyrics) {
      setError('Escribe la letra antes de guardarla.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await LyricsTextService.save(trackId, lyrics)
      onSaved(response.data.lyrics)
    } catch {
      setError('No se pudo guardar la letra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-10 text-left">
      <p className="mb-3 text-sm text-stage-muted">
        Pega la letra, una línea por verso. Quedará en tu cuenta; más adelante podrá
        revisarse para el catálogo global.
      </p>
      <textarea
        className="lyric-field app-scroll"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Is this the real life?&#10;Is this just fantasy?"
        rows={12}
        maxLength={20000}
        aria-label="Letra de la canción"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        {onCancel ? (
          <Button variant="ghost" className="w-auto" onClick={onCancel}>
            <X size={16} />
            Cancelar
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={() => void handleSave()} disabled={saving || !draft.trim()}>
          {initial ? <Check size={18} /> : <Plus size={18} />}
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
    </div>
  )
}
