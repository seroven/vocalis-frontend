export interface PlayerTokenData {
  accessToken: string
  expiresAt: string
}

export interface PlayTrackData {
  playing: boolean
}

export type PlayerStatus = 'connecting' | 'ready' | 'playing' | 'paused' | 'error'
