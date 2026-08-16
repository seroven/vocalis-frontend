export type SpotifyPlaybackState = {
  paused: boolean
  position: number
  duration: number
  track_window?: {
    current_track?: {
      id?: string | null
      uri?: string | null
    } | null
  }
}

export type SpotifyPlayer = {
  connect: () => Promise<boolean>
  disconnect: () => void
  addListener: (event: string, cb: (payload: unknown) => void) => boolean
  activateElement?: () => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
  setVolume: (volume: number) => Promise<void>
  getVolume: () => Promise<number>
  getCurrentState: () => Promise<SpotifyPlaybackState | null>
}

type SpotifyNamespace = {
  Player: new (options: {
    name: string
    getOAuthToken: (cb: (token: string) => void) => void
    volume?: number
  }) => SpotifyPlayer
}

declare global {
  interface Window {
    Spotify?: SpotifyNamespace
    onSpotifyWebPlaybackSDKReady?: () => void
  }
}

let loading: Promise<void> | null = null

export function loadSpotifySdk() {
  if (window.Spotify) {
    return Promise.resolve()
  }

  if (loading) {
    return loading
  }

  loading = new Promise((resolve, reject) => {
    const previous = window.onSpotifyWebPlaybackSDKReady
    window.onSpotifyWebPlaybackSDKReady = () => {
      previous?.()
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    script.onerror = () => {
      loading = null
      reject(new Error('No se pudo cargar el reproductor de Spotify'))
    }
    document.body.appendChild(script)
  })

  return loading
}
