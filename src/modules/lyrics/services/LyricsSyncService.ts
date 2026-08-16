import { apiGet, apiPut } from '../../../config/api'
import type { CatalogSearchData } from '../../home/interfaces/search.interface'
import type { LyricLine, LyricSyncData } from '../interfaces/lyrics-sync.interface'

export class LyricsSyncService {
  static list(query = '') {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set('q', query.trim())
    }

    const suffix = params.toString()
    return apiGet<CatalogSearchData>(`/lyrics/focus${suffix ? `?${suffix}` : ''}`)
  }

  static get(spotifyId: string) {
    return apiGet<LyricSyncData>(`/lyrics/sync/${spotifyId}`)
  }

  static save(
    spotifyId: string,
    lines: LyricLine[],
    track?: { title: string; subtitle: string; imageUrl: string | null },
  ) {
    return apiPut<LyricSyncData>(`/lyrics/sync/${spotifyId}`, { lines, track })
  }
}
