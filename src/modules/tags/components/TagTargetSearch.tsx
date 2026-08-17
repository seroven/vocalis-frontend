import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { TextField } from '../../../shared/components/TextField'
import { pageEase } from '../../../shared/lib/page-motion'
import { AnimatePresence, motion } from 'framer-motion'
import type { CatalogItem } from '../../home/interfaces/search.interface'
import { SpotifyService } from '../../home/services/SpotifyService'
import type { TagScope, TagTarget } from '../interfaces/tag.interface'
import { TAG_SCOPE_LABELS } from '../interfaces/tag.interface'

function spotifyId(item: CatalogItem) {
  return item.id.includes(':') ? item.id.split(':')[1] ?? item.id : item.id
}

const PLACEHOLDER: Record<Exclude<TagScope, 'general'>, string> = {
  artist: 'Busca un artista',
  album: 'Busca un álbum',
  track: 'Busca una canción',
}

export function TagTargetSearch({
  scope,
  value,
  onChange,
}: {
  scope: Exclude<TagScope, 'general'>
  value: TagTarget | null
  onChange: (target: TagTarget | null) => void
}) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<CatalogItem[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const value = query.trim()
    if (value.length < 2) {
      setItems([])
      setBusy(false)
      return
    }

    let cancelled = false
    setBusy(true)
    const timer = window.setTimeout(() => {
      void SpotifyService.search(value, scope)
        .then((response) => {
          if (!cancelled) {
            setItems(response.data.items.filter((item) => item.type === scope))
          }
        })
        .catch(() => {
          if (!cancelled) {
            setItems([])
          }
        })
        .finally(() => {
          if (!cancelled) {
            setBusy(false)
          }
        })
    }, 280)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, scope])

  if (value) {
    return (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-stage-fg/5 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.14em] text-accent uppercase">
            {TAG_SCOPE_LABELS[scope]}
          </p>
          <p className="truncate font-semibold text-stage-fg">{value.name}</p>
        </div>
        <Button variant="ghost" className="w-auto" onClick={() => onChange(null)}>
          <RefreshCw size={15} />
          Cambiar
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <TextField
        label={PLACEHOLDER[scope]}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={PLACEHOLDER[scope]}
        busy={busy}
      />
      <AnimatePresence>
        {items.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: pageEase }}
            className="mt-3 space-y-1"
          >
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-stage-fg/5"
                  onClick={() => {
                    onChange({
                      id: spotifyId(item),
                      name: item.title,
                      scope,
                    })
                    setQuery('')
                    setItems([])
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className={`h-10 w-10 shrink-0 object-cover ${
                        item.type === 'artist' ? 'rounded-full' : 'rounded-xl'
                      }`}
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-sm font-bold text-accent">
                      {item.title.trim().charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-stage-fg">{item.title}</span>
                    {item.subtitle ? (
                      <span className="block truncate text-sm text-stage-muted">{item.subtitle}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : query.trim().length >= 2 && !busy ? (
          <p className="mt-3 text-sm text-stage-muted">No encontramos nada con esa búsqueda.</p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
