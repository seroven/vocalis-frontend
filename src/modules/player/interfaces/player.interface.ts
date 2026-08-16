export interface PlayerTokenData {
  accessToken: string
  expiresAt: string
}

export interface PlayTrackData {
  playing: boolean
}

export type PlayerStatus = 'connecting' | 'ready' | 'playing' | 'paused' | 'error'

export type PlayerSession = {
  status: PlayerStatus
  position: number
  duration: number
  error: string | null
  toggle: () => void
  seek: (positionMs: number) => void
  busy: boolean
  loadingLabel: string | null
}
