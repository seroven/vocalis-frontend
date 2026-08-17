import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Disc3, Globe, Mic2, Music2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BackButton } from '../../shared/components/BackButton'
import { Button } from '../../shared/components/Button'
import { pageEase } from '../../shared/lib/page-motion'
import { TagChip } from './components/TagChip'
import { TagForm } from './components/TagForm'
import {
  TAG_SCOPES,
  TAG_SCOPE_LABELS,
  type Tag,
  type TagScope,
} from './interfaces/tag.interface'
import { useTags } from './hooks/useTags'
import { TagsService } from './services/TagsService'

const SCOPE_META = {
  general: { label: 'General', hint: 'En cualquier canción', Icon: Globe },
  artist: { label: 'Artistas', hint: 'Ligadas a un artista', Icon: Mic2 },
  album: { label: 'Álbumes', hint: 'Ligadas a un álbum', Icon: Disc3 },
  track: { label: 'Canciones', hint: 'Ligadas a una canción', Icon: Music2 },
} as const

function countLabel(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

function groupTags(scope: TagScope, items: Tag[]) {
  if (scope === 'general') {
    return [{ key: 'general', title: TAG_SCOPE_LABELS.general, items }]
  }

  return Object.values(
    items.reduce<Record<string, { key: string; title: string; items: Tag[] }>>(
      (groups, tag) => {
        const key = tag.targetId ?? 'sin-destino'
        groups[key] ??= {
          key,
          title: tag.targetName || TAG_SCOPE_LABELS[scope],
          items: [],
        }
        groups[key].items.push(tag)
        return groups
      },
      {},
    ),
  )
}

export function TagsPage() {
  const { tags, setTags } = useTags()
  const [editing, setEditing] = useState<Tag | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function openEdit(tag: Tag) {
    setEditing(tag)
    setFormOpen(true)
  }

  async function handleRemove(tag: Tag) {
    await TagsService.remove(tag.id)
    setTags((current) => current.filter((item) => item.id !== tag.id))
    if (editing?.id === tag.id) {
      closeForm()
    }
  }

  return (
    <section className="w-full">
      <BackButton />
      <h1 className="mt-6 text-center font-display text-5xl tracking-tight text-stage-fg md:text-6xl">
        Mis etiquetas
      </h1>
      <p className="mt-3 text-center text-stage-muted">
        Crea una etiqueta general o búscala por artista, álbum o canción.
      </p>

      <div className="panel mt-10 overflow-hidden rounded-[1.8rem]">
        <button
          type="button"
          aria-expanded={formOpen}
          className="flex w-full items-center gap-3 px-6 py-5 text-left"
          onClick={() => {
            if (formOpen) {
              closeForm()
              return
            }
            setFormOpen(true)
          }}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Plus size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs tracking-[0.16em] text-accent uppercase">
              {editing ? 'Editar etiqueta' : 'Nueva etiqueta'}
            </span>
            <span className="mt-0.5 block font-semibold text-stage-fg">
              {editing
                ? `Cambiar ${editing.name}`
                : formOpen
                  ? 'Completa los datos y créala'
                  : 'Pulsa para crear una etiqueta'}
            </span>
          </span>
          <ChevronDown
            size={20}
            className={`shrink-0 text-stage-muted transition-transform duration-300 ${
              formOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {formOpen ? (
            <motion.div
              key="tag-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: pageEase }}
              className="overflow-hidden"
            >
              <div className="border-t border-line/60 px-6 pt-5 pb-6">
                <TagForm
                  key={editing?.id ?? 'new'}
                  compact
                  pickTarget
                  initial={editing ?? undefined}
                  onSaved={(tag) => {
                    setTags((current) =>
                      editing
                        ? current.map((item) => (item.id === tag.id ? tag : item))
                        : [tag, ...current],
                    )
                    closeForm()
                  }}
                  onCancel={closeForm}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-4">
        {TAG_SCOPES.map((scope) => {
          const items = tags.filter((tag) => tag.scope === scope)
          const groups = groupTags(scope, items)
          const meta = SCOPE_META[scope]

          return (
            <section key={scope} className="panel rounded-[1.8rem] px-5 py-5">
              <header className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <meta.Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl tracking-tight text-stage-fg">
                    {meta.label}
                  </h2>
                  <p className="text-sm text-stage-muted">
                    {items.length === 0
                      ? meta.hint
                      : scope === 'general'
                        ? countLabel(items.length, 'etiqueta')
                        : `${countLabel(items.length, 'etiqueta')} · ${countLabel(groups.length, scope === 'artist' ? 'artista' : scope === 'album' ? 'álbum' : 'canción')}`}
                  </p>
                </div>
              </header>

              {items.length > 0 ? (
                <div className={`mt-4 ${scope === 'general' ? '' : 'space-y-3'}`}>
                  {groups.map((group) => (
                    <div
                      key={group.key}
                      className={
                        scope === 'general'
                          ? ''
                          : 'rounded-2xl bg-stage-fg/5 px-4 py-3'
                      }
                    >
                      {scope !== 'general' ? (
                        <h3 className="mb-3 text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                          {group.title}
                        </h3>
                      ) : null}
                      <ul className="space-y-2">
                        {group.items.map((tag) => (
                          <li
                            key={tag.id}
                            className={`flex items-center justify-between gap-3 ${
                              scope === 'general'
                                ? 'rounded-2xl bg-stage-fg/5 px-3 py-2.5'
                                : 'rounded-xl py-1'
                            }`}
                          >
                            <TagChip tag={tag} />
                            <div className="flex shrink-0 gap-1">
                              <Button
                                variant="icon"
                                aria-label={`Editar ${tag.name}`}
                                className="h-9 w-9"
                                onClick={() => openEdit(tag)}
                              >
                                <Pencil size={15} />
                              </Button>
                              <Button
                                variant="icon"
                                aria-label={`Borrar ${tag.name}`}
                                className="h-9 w-9"
                                onClick={() => void handleRemove(tag)}
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-stage-muted">Todavía no hay etiquetas aquí.</p>
              )}
            </section>
          )
        })}
      </div>
    </section>
  )
}
