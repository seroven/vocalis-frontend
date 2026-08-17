import { AnimatePresence, motion } from 'framer-motion'
import { Check, Disc3, Globe, Mic2, Music2, Plus, X } from 'lucide-react'
import { useId, useState, type CSSProperties } from 'react'
import { Button } from '../../../shared/components/Button'
import { pageEase } from '../../../shared/lib/page-motion'
import { TextField } from '../../../shared/components/TextField'
import {
  TAG_COLORS,
  TAG_COLOR_CSS,
  TAG_COLOR_LABELS,
  TAG_SCOPES,
  TAG_SHAPES,
  TAG_SHAPE_LABELS,
  type Tag,
  type TagColor,
  type TagScope,
  type TagShape,
  type TagTarget,
} from '../interfaces/tag.interface'
import { TagsService } from '../services/TagsService'
import { TagSwatch } from './TagChip'
import { TagTargetSearch } from './TagTargetSearch'

const SCOPE_META = {
  general: { label: 'General', Icon: Globe },
  artist: { label: 'Artista', Icon: Mic2 },
  album: { label: 'Álbum', Icon: Disc3 },
  track: { label: 'Canción', Icon: Music2 },
} as const

type Draft = {
  name: string
  color: TagColor
  shape: TagShape
  scope: TagScope
}

const emptyDraft = (scope: TagScope): Draft => ({
  name: '',
  color: 'accent',
  shape: 'mark',
  scope,
})

export function TagForm({
  scopeLocked,
  target,
  pickTarget = false,
  initial,
  compact = false,
  onSaved,
  onCancel,
}: {
  scopeLocked?: TagScope
  target?: TagTarget
  pickTarget?: boolean
  initial?: Tag
  compact?: boolean
  onSaved: (tag: Tag) => void
  onCancel?: () => void
}) {
  const [draft, setDraft] = useState<Draft>(
    initial
      ? {
          name: initial.name,
          color: initial.color,
          shape: initial.shape,
          scope: initial.scope,
        }
      : emptyDraft(target?.scope ?? scopeLocked ?? 'general'),
  )
  const [picked, setPicked] = useState<TagTarget | null>(
    target ??
      (initial?.targetId && initial.scope !== 'general'
        ? {
            id: initial.targetId,
            name: initial.targetName || initial.targetId,
            scope: initial.scope,
          }
        : null),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scopePillId = useId()
  const chosen = target ?? picked
  const scope = target?.scope ?? scopeLocked ?? draft.scope

  async function handleSave() {
    const name = draft.name.trim()
    if (!name) {
      return
    }

    if (scope !== 'general' && !chosen) {
      setError('Elige un artista, álbum o canción.')
      return
    }

    setSaving(true)
    setError(null)

    try {

      const payload = {
        name,
        color: draft.color,
        shape: draft.shape,
        scope,
        targetId: scope === 'general' ? null : (chosen?.id ?? null),
        targetName: scope === 'general' ? null : (chosen?.name ?? null),
      }
      const response = initial
        ? await TagsService.update(initial.id, payload)
        : await TagsService.create(payload)
      onSaved(response.data)
      if (!initial) {
        setDraft(emptyDraft(target?.scope ?? scopeLocked ?? 'general'))
        if (pickTarget) {
          setPicked(null)
        }
      }
    } catch {
      setError('No se pudo guardar la etiqueta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div>
        <TextField
          label="Nombre de la etiqueta"
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          placeholder="Nombre de la etiqueta"
          maxLength={80}
        />
      </div>

      <p className="mt-4 mb-2 text-sm font-semibold text-stage-fg">Color</p>
      <div className="flex flex-wrap gap-2 px-1 py-1">
        {TAG_COLORS.map((color) => (
          <TagSwatch
            key={color}
            color={color}
            label={TAG_COLOR_LABELS[color]}
            selected={draft.color === color}
            onClick={() => setDraft((current) => ({ ...current, color }))}
          />
        ))}
      </div>

      <p className="mt-4 mb-2 text-sm font-semibold text-stage-fg">Forma</p>
      <div className="flex flex-wrap gap-2 px-1 py-1">
        {TAG_SHAPES.map((shape) => (
          <TagSwatch
            key={shape}
            color={draft.color}
            shape={shape}
            label={TAG_SHAPE_LABELS[shape]}
            selected={draft.shape === shape}
            onClick={() => setDraft((current) => ({ ...current, shape }))}
          />
        ))}
      </div>

      {pickTarget && !target ? (
        <>
          <p className="mt-4 mb-2 text-sm font-semibold text-stage-fg">Clasificación</p>
          <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-stage-fg/5 p-1.5">
            {TAG_SCOPES.map((item) => {
              const meta = SCOPE_META[item]
              const selected = draft.scope === item
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  className={`relative isolate flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[0.75rem] font-semibold transition-colors ${
                    selected ? 'text-accent' : 'text-stage-muted hover:text-stage-fg'
                  }`}
                  onClick={() => {
                    setDraft((current) => ({ ...current, scope: item }))
                    setPicked(null)
                    setError(null)
                  }}
                >
                  {selected ? (
                    <motion.span
                      layoutId={scopePillId}
                      className="absolute inset-0 -z-10 rounded-xl bg-accent-soft"
                      transition={{ duration: 0.34, ease: pageEase }}
                    />
                  ) : null}
                  <meta.Icon size={18} strokeWidth={selected ? 2.3 : 1.8} />
                  {meta.label}
                </button>
              )
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {draft.scope !== 'general' ? (
              <motion.div
                key={draft.scope}
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.32, ease: pageEase }}
                className="overflow-hidden"
              >
                <TagTargetSearch
                  scope={draft.scope}
                  value={picked}
                  onChange={setPicked}
                />
              </motion.div>
            ) : (
              <motion.div
                key="general-hint"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.32, ease: pageEase }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm text-stage-muted">
                  Estará disponible en todas las canciones, álbumes y artistas.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : target ? (
        <p className="mt-4 text-sm text-stage-muted">Se creará para {target.name}.</p>
      ) : initial?.targetName ? (
        <p className="mt-4 text-sm text-stage-muted">Pertenece a {initial.targetName}.</p>
      ) : null}

      <div className="mt-5 rounded-2xl bg-stage-fg/5 px-4 py-5 text-center">
        <p className="text-xs tracking-[0.16em] text-stage-muted uppercase">Vista previa</p>
        <p className="mt-3 text-lg leading-relaxed text-stage-muted">
          Is this the{' '}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${draft.color}-${draft.shape}`}
              data-tag-color={draft.color}
              className={`lyric-tag lyric-tag-preview is-${draft.shape}`}
              style={{ '--tag': TAG_COLOR_CSS[draft.color] } as CSSProperties}
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -6 }}
              transition={{ duration: 0.28, ease: pageEase }}
            >
              real
            </motion.span>
          </AnimatePresence>{' '}
          life?
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {onCancel ? (
          <Button variant="ghost" className="w-auto" onClick={onCancel}>
            <X size={16} />
            Cancelar
          </Button>
        ) : (
          <span />
        )}
        <Button
          onClick={() => void handleSave()}
          disabled={saving || !draft.name.trim() || (scope !== 'general' && !chosen)}
        >
          {saving ? (
            'Guardando…'
          ) : initial ? (
            <>
              <Check size={18} />
              Guardar cambios
            </>
          ) : (
            <>
              <Plus size={18} />
              {compact ? 'Crear' : 'Crear etiqueta'}
            </>
          )}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
    </div>
  )
}
