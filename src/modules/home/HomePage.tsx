import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CatalogGrid, SearchPulse } from './components/CatalogGrid'
import { SearchFilters } from './components/SearchFilters'
import type { CatalogItem, SearchFilter } from './interfaces/search.interface'
import { SpotifyService } from './services/SpotifyService'

const ease = [0.22, 1, 0.36, 1] as const

function firstName(displayName: string | null | undefined) {
  const name = displayName?.trim()
  if (!name) {
    return ''
  }

  return name.split(/\s+/)[0]
}

type SearchStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export function HomePage() {
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
  const name = useMemo(() => firstName(user?.displayName), [user?.displayName])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SearchFilter>('all')
  const [items, setItems] = useState<CatalogItem[]>([])
  const [resultQuery, setResultQuery] = useState('')
  const [resultFilter, setResultFilter] = useState<SearchFilter>('all')
  const [status, setStatus] = useState<SearchStatus>('idle')

  const value = query.trim()
  const searching = value.length >= 2
  const busy = searching && (value !== resultQuery || filter !== resultFilter)

  const placeholder =
    filter === 'track'
      ? 'Busca una canción'
      : filter === 'album'
        ? 'Busca un álbum'
        : filter === 'artist'
          ? 'Busca un artista'
          : 'Busca artista, álbum o canción'

  useEffect(() => {
    if (value.length < 2) {
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setStatus('loading')

      void SpotifyService.search(value, filter)
        .then((response) => {
          if (cancelled) {
            return
          }

          setItems(response.data.items)
          setResultQuery(value)
          setResultFilter(filter)
          setStatus(response.data.items.length > 0 ? 'ready' : 'empty')
        })
        .catch(() => {
          if (!cancelled) {
            setResultQuery(value)
            setResultFilter(filter)
            setStatus('error')
          }
        })
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [value, filter])

  const visibleItems = searching ? items : []
  const message =
    !busy && searching && status === 'empty'
      ? 'No encontramos nada con esa búsqueda.'
      : !busy && searching && status === 'error'
        ? 'No se pudo buscar ahora. Prueba de nuevo.'
        : null

  return (
    <section className="flex min-h-full w-full flex-col">
      <div
        className={`flex w-full flex-col items-center ${
          searching ? '' : 'flex-1 justify-center'
        }`}
      >
        <motion.div
          layout={reduceMotion ? false : 'position'}
          className="flex w-full flex-col items-center text-center"
          transition={{ layout: { duration: 0.5, ease } }}
        >
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-stage-fg md:text-6xl">
            {name ? `Hola, ${name}` : 'Hola'}
          </h1>

          <Link
            to="/grabaciones"
            className="cta pressable mt-8 inline-flex rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-fg"
          >
            Mis grabaciones
          </Link>

          <div className="mt-10 flex w-full max-w-lg items-center gap-2">
            <label className={`search-field-wrap min-w-0 flex-1 ${busy ? 'is-busy' : ''}`}>
              <span className="sr-only">{placeholder}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                className="search-field"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <SearchFilters value={filter} onChange={setFilter} />
          </div>

          <div className="mt-5 grid min-h-6 place-items-center">
            <AnimatePresence mode="wait">
              {busy ? (
                <SearchPulse key="pulse" />
              ) : message ? (
                <motion.p
                  key={message}
                  className="text-sm text-stage-muted"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease }}
                >
                  {message}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {visibleItems.length > 0 ? (
          <motion.div
            key={`${resultQuery}:${resultFilter}`}
            className="mx-auto w-full max-w-[53rem]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{
              opacity: busy ? 0.4 : 1,
              scale: busy && !reduceMotion ? 0.985 : 1,
            }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.32, ease }}
          >
            <CatalogGrid items={visibleItems} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
