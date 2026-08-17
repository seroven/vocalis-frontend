import { apiPut } from '../../../config/api'
import type { LyricsSource } from '../../home/interfaces/search.interface'

export class LyricsTextService {
  static save(spotifyId: string, lyrics: string) {
    return apiPut<{ lyrics: string; lyricsSource: LyricsSource }>(
      `/lyrics/text/${spotifyId}`,
      { lyrics },
    )
  }
}
