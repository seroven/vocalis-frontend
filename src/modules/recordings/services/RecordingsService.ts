import { apiBlob, apiDelete, apiGet, apiPut, apiUpload } from '../../../config/api'
import type { RecordingItem, RecordingTrackGroup } from '../interfaces/recording.interface'

export class RecordingsService {
  static list(trackId?: string) {
    const suffix = trackId ? `?trackId=${encodeURIComponent(trackId)}` : ''
    return apiGet<{ items: RecordingTrackGroup[] }>(`/recordings${suffix}`)
  }

  static create(payload: {
    audio: Blob
    spotifyId: string
    trackTitle: string
    artistName: string
    imageUrl: string | null
    durationMs: number
  }) {
    const body = new FormData()
    const extension = payload.audio.type.includes('mp4') ? 'm4a' : 'webm'
    body.append('audio', payload.audio, `take.${extension}`)
    body.append('spotifyId', payload.spotifyId)
    body.append('trackTitle', payload.trackTitle)
    body.append('artistName', payload.artistName)
    if (payload.imageUrl) {
      body.append('imageUrl', payload.imageUrl)
    }
    body.append('durationMs', String(Math.round(payload.durationMs)))
    return apiUpload<RecordingItem>('/recordings', body)
  }

  static rename(id: number, title: string) {
    return apiPut<RecordingItem>(`/recordings/${id}`, { title })
  }

  static remove(id: number) {
    return apiDelete<{ removed: boolean }>(`/recordings/${id}`)
  }

  static audio(id: number) {
    return apiBlob(`/recordings/${id}/audio`)
  }
}
