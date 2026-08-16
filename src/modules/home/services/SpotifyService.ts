import { apiGet } from '../../../config/api'
import type { ApiResponse } from '../../../shared/interfaces/api-response.interface'
import type {
  AlbumDetail,
  ArtistDetail,
  CatalogSearchData,
  SearchFilter,
  TrackPageData,
} from '../interfaces/search.interface'

const pending = new Map<string, Promise<ApiResponse<unknown>>>()

function once<T>(key: string, run: () => Promise<ApiResponse<T>>) {
  const current = pending.get(key)
  if (current) {
    return current as Promise<ApiResponse<T>>
  }

  const request = run().finally(() => {
    pending.delete(key)
  })
  pending.set(key, request)
  return request
}

export class SpotifyService {
  static search(query: string, type: SearchFilter = 'all') {
    const params = new URLSearchParams({ q: query })

    if (type !== 'all') {
      params.set('type', type)
    }

    return apiGet<CatalogSearchData>(`/spotify/search?${params.toString()}`)
  }

  static album(id: string) {
    return once(`album:${id}`, () => apiGet<AlbumDetail>(`/spotify/albums/${id}`))
  }

  static artist(id: string) {
    return once(`artist:${id}`, () => apiGet<ArtistDetail>(`/spotify/artists/${id}`))
  }

  static track(id: string) {
    return once(`track:${id}`, () => apiGet<TrackPageData>(`/spotify/tracks/${id}`))
  }
}
