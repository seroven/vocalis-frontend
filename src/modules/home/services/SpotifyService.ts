import { apiGet } from '../../../config/api'
import type { CatalogSearchData, SearchFilter } from '../interfaces/search.interface'

export class SpotifyService {
  static search(query: string, type: SearchFilter = 'all') {
    const params = new URLSearchParams({ q: query })

    if (type !== 'all') {
      params.set('type', type)
    }

    return apiGet<CatalogSearchData>(`/spotify/search?${params.toString()}`)
  }
}
