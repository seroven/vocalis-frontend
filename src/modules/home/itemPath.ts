import type { CatalogItem } from './interfaces/search.interface'

export function itemPath(item: CatalogItem) {
  const spotifyId = item.id.split(':')[1] ?? item.id

  if (item.type === 'album') {
    return `/album/${spotifyId}`
  }

  if (item.type === 'artist') {
    return `/artista/${spotifyId}`
  }

  return `/cancion/${spotifyId}`
}
