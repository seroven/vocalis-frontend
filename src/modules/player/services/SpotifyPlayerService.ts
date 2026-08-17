import { apiGet, apiPut } from '../../../config/api'
import type { PlayerTokenData, PlayTrackData } from '../interfaces/player.interface'

let cached: { token: string; expiresAt: number } | null = null

export class SpotifyPlayerService {
  static async accessToken() {
    if (cached && Date.now() < cached.expiresAt - 60_000) {
      return cached.token
    }

    const response = await apiGet<PlayerTokenData>('/spotify/player/token')
    cached = {
      token: response.data.accessToken,
      expiresAt: new Date(response.data.expiresAt).getTime(),
    }
    return cached.token
  }

  static play(trackId: string, deviceId: string, positionMs = 0) {
    return apiPut<PlayTrackData>('/spotify/player/play', {
      trackId,
      deviceId,
      positionMs,
    })
  }
}
