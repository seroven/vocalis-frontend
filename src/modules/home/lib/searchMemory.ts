import type { CatalogItem, SearchFilter } from '../interfaces/search.interface'

const KEY = 'vocalis.search'
const FILTERS: SearchFilter[] = ['all', 'track', 'album', 'artist']

type SearchSnapshot = {
  q: string
  filter: SearchFilter
  items: CatalogItem[]
}

export function parseSearchFilter(value: string | null): SearchFilter {
  if (value && FILTERS.includes(value as SearchFilter)) {
    return value as SearchFilter
  }

  return 'all'
}

export function readSearchSnapshot(q: string, filter: SearchFilter): CatalogItem[] | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) {
      return null
    }

    const data = JSON.parse(raw) as SearchSnapshot
    if (data.q === q && data.filter === filter && Array.isArray(data.items)) {
      return data.items
    }
  } catch {
    return null
  }

  return null
}

export function writeSearchSnapshot(q: string, filter: SearchFilter, items: CatalogItem[]) {
  sessionStorage.setItem(KEY, JSON.stringify({ q, filter, items }))
}
