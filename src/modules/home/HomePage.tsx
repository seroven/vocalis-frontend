import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ButtonLink } from '../../shared/components/Button'
import { TextField } from '../../shared/components/TextField'
import { useAuth } from '../auth/AuthContext'
import { FavoritesService } from '../favorites/services/FavoritesService'
import { CatalogGrid, SearchPulse } from './components/CatalogGrid'
import { SearchFilters } from './components/SearchFilters'
import type { CatalogItem, SearchFilter } from './interfaces/search.interface'
import {
  parseSearchFilter,
  readSearchSnapshot,
  writeSearchSnapshot,
} from './lib/searchMemory'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const filter = parseSearchFilter(searchParams.get('type'))
  const favoritesOnly = searchParams.get('fav') === '1'
  const value = query.trim()
  const listing = favoritesOnly || value.length >= 2
  const skipDebounce = useRef(listing)

  const [items, setItems] = useState<CatalogItem[]>(() => {
    if (favoritesOnly) {
      return []
    }

    const snapshot = value.length >= 2 ? readSearchSnapshot(value, filter) : null
    return snapshot ?? []
  })
  const [resultQuery, setResultQuery] = useState(() =>
    !favoritesOnly && value.length >= 2 && readSearchSnapshot(value, filter) ? value : '',
  )
  const [resultFilter, setResultFilter] = useState<SearchFilter>(() =>
    !favoritesOnly && value.length >= 2 && readSearchSnapshot(value, filter) ? filter : 'all',
  )
  const [resultFavorites, setResultFavorites] = useState(false)
  const [status, setStatus] = useState<SearchStatus>(() => {
    if (favoritesOnly) {
      return 'idle'
    }

    const snapshot = value.length >= 2 ? readSearchSnapshot(value, filter) : null
    if (!snapshot) {
      return 'idle'
    }
    return snapshot.length > 0 ? 'ready' : 'empty'
  })

  const busy =
    listing &&
    (value !== resultQuery || filter !== resultFilter || favoritesOnly !== resultFavorites)

  function setQuery(nextQuery: string) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (nextQuery) {
          params.set('q', nextQuery)
        } else {
          params.delete('q')
        }
        return params
      },
      { replace: true },
    )
  }

  function setFilter(nextFilter: SearchFilter) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (nextFilter === 'all') {
          params.delete('type')
        } else {
          params.set('type', nextFilter)
        }
        return params
      },
      { replace: true },
    )
  }

  function setFavoritesOnly(next: boolean) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (next) {
          params.set('fav', '1')
        } else {
          params.delete('fav')
        }
        return params
      },
      { replace: true },
    )
  }

  const placeholder = favoritesOnly
    ? 'Filtra tus favoritos'
    : filter === 'track'
      ? 'Busca una canción'
      : filter === 'album'
        ? 'Busca un álbum'
        : filter === 'artist'
          ? 'Busca un artista'
          : 'Busca artista, álbum o canción'

  useEffect(() => {
    if (!listing) {
      return
    }

    const snapshot =
      !favoritesOnly && value.length >= 2 ? readSearchSnapshot(value, filter) : null
    let cancelled = false
    const delay = skipDebounce.current || snapshot || favoritesOnly ? 0 : 350
    skipDebounce.current = false
    const timer = window.setTimeout(() => {
      if (!snapshot) {
        setStatus('loading')
      }

      const request = favoritesOnly
        ? FavoritesService.list(filter, value)
        : SpotifyService.search(value, filter)

      void request
        .then((response) => {
          if (cancelled) {
            return
          }

          if (!favoritesOnly) {
            writeSearchSnapshot(value, filter, response.data.items)
          }

          setItems(response.data.items)
          setResultQuery(value)
          setResultFilter(filter)
          setResultFavorites(favoritesOnly)
          setStatus(response.data.items.length > 0 ? 'ready' : 'empty')
        })
        .catch(() => {
          if (!cancelled) {
            setResultQuery(value)
            setResultFilter(filter)
            setResultFavorites(favoritesOnly)
            if (!snapshot) {
              setStatus('error')
            }
          }
        })
    }, delay)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [favoritesOnly, filter, listing, value])

  const visibleItems = listing ? items : []
  const message =
    !busy && listing && status === 'empty'
      ? favoritesOnly
        ? value
          ? 'Ningún favorito coincide con eso.'
          : 'Aún no tienes favoritos.'
        : 'No encontramos nada con esa búsqueda.'
      : !busy && listing && status === 'error'
        ? 'No se pudo buscar ahora. Prueba de nuevo.'
        : null

  return (
    <section className="flex min-h-full w-full flex-col">
      <div
        className={`flex w-full flex-col items-center ${
          listing ? '' : 'flex-1 justify-center'
        }`}
      >
        <motion.div
          layout={reduceMotion ? false : 'position'}
          className="flex w-full flex-col items-center text-center"
          transition={{ layout: { duration: 0.5, ease } }}
        >
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-stage-fg md:text-6xl">
            {name ? (
              <>
                Hola, <span className="text-accent">{name}</span>
              </>
            ) : (
              'Hola'
            )}
          </h1>

          <ButtonLink to="/grabaciones" className="mt-8">
            Mis grabaciones
          </ButtonLink>

          <div className="mt-10 flex w-full max-w-lg items-center gap-2">
            <TextField
              label={placeholder}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              busy={busy}
              className="min-w-0 flex-1"
            />
            <SearchFilters
              value={filter}
              onChange={setFilter}
              favoritesOnly={favoritesOnly}
              onFavoritesOnlyChange={setFavoritesOnly}
            />
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
            key={`${resultQuery}:${resultFilter}:${resultFavorites ? 'fav' : 'all'}`}
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
