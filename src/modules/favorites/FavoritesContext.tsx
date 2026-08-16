import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CatalogItem } from '../home/interfaces/search.interface'
import { FavoritesService } from './services/FavoritesService'

type FavoritesContextValue = {
  keys: Set<string>
  isFavorite: (item: CatalogItem) => boolean
  toggle: (item: CatalogItem) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    void FavoritesService.list()
      .then((response) => {
        if (!cancelled) {
          setKeys(new Set(response.data.items.map((item) => item.id)))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setKeys(new Set())
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const isFavorite = useCallback(
    (item: CatalogItem) => keys.has(item.id),
    [keys],
  )

  const toggle = useCallback(async (item: CatalogItem) => {
    const existed = keys.has(item.id)

    setKeys((current) => {
      const next = new Set(current)
      if (existed) {
        next.delete(item.id)
      } else {
        next.add(item.id)
      }
      return next
    })

    try {
      if (existed) {
        await FavoritesService.remove(item)
      } else {
        await FavoritesService.add(item)
      }
    } catch {
      setKeys((current) => {
        const next = new Set(current)
        if (existed) {
          next.add(item.id)
        } else {
          next.delete(item.id)
        }
        return next
      })
    }
  }, [keys])

  const value = useMemo(
    () => ({ keys, isFavorite, toggle }),
    [isFavorite, keys, toggle],
  )

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const value = useContext(FavoritesContext)

  if (!value) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider')
  }

  return value
}
