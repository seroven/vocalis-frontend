import { apiGet, apiPut } from '../../../config/api'
import type { LyricLine, LyricSyncData } from '../interfaces/lyrics-sync.interface'

export class LyricsSyncService {
  static get(spotifyId: string) {
    return apiGet<LyricSyncData>(`/lyrics/sync/${spotifyId}`)
  }

  static save(spotifyId: string, lines: LyricLine[]) {
    return apiPut<LyricSyncData>(`/lyrics/sync/${spotifyId}`, { lines })
  }
}
