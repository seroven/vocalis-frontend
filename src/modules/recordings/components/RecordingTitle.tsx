import { Check, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import type { RecordingItem } from '../interfaces/recording.interface'
import { RecordingsService } from '../services/RecordingsService'

export function takeLabel(take: Pick<RecordingItem, 'title'>, fallback: string) {
  return take.title?.trim() || fallback
}

export function RecordingTitle({
  take,
  fallback,
  onRenamed,
}: {
  take: RecordingItem
  fallback: string
  onRenamed: (title: string | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(take.title ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (saving) {
      return
    }

    setSaving(true)
    try {
      const response = await RecordingsService.rename(take.id, draft.trim())
      onRenamed(response.data.title)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <form
        className="flex min-w-0 flex-1 items-center gap-1"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-xl bg-stage-fg/5 px-2.5 py-1 text-sm font-semibold text-stage-fg outline-none ring-1 ring-accent/40"
          value={draft}
          maxLength={80}
          autoFocus
          aria-label="Título de la grabación"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setDraft(take.title ?? '')
              setEditing(false)
            }
          }}
        />
        <Button
          variant="icon"
          aria-label="Guardar título"
          className="h-8 w-8"
          disabled={saving}
          type="submit"
        >
          <Check size={14} />
        </Button>
      </form>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <p className="truncate font-semibold text-stage-fg">{takeLabel(take, fallback)}</p>
      <Button
        variant="icon"
        aria-label="Editar título"
        className="h-8 w-8"
        onClick={(event) => {
          event.stopPropagation()
          setDraft(take.title ?? fallback)
          setEditing(true)
        }}
      >
        <Pencil size={14} />
      </Button>
    </div>
  )
}
