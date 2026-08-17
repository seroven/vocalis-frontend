import { useCallback, useEffect, useRef, useState } from 'react'
import type { PlayerStatus } from '../interfaces/player.interface'
import {
  loadSpotifySdk,
  type SpotifyPlaybackState,
  type SpotifyPlayer,
} from '../lib/spotifySdk'
import { SpotifyPlayerService } from '../services/SpotifyPlayerService'

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function stateTrackId(state: SpotifyPlaybackState | null) {
  const track = state?.track_window?.current_track
  if (!track) {
    return null
  }

  if (track.id) {
    return track.id
  }

  const uri = track.uri
  if (uri?.startsWith('spotify:track:')) {
    return uri.slice('spotify:track:'.length)
  }

  return null
}

const VOLUME_KEY = 'vocalis.player.volume'
const DEFAULT_VOLUME = 0.8

function readStoredVolume() {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY)
    if (raw == null) {
      return DEFAULT_VOLUME
    }

    const value = Number(raw)
    if (!Number.isFinite(value)) {
      return DEFAULT_VOLUME
    }

    return Math.min(1, Math.max(0, value))
  } catch {
    return DEFAULT_VOLUME
  }
}

let sharedPlayer: SpotifyPlayer | null = null
let sharedDeviceId: string | null = null
let connecting: Promise<string> | null = null
let sharedVolume = readStoredVolume()
const volumeListeners = new Set<(volume: number) => void>()
const playbackListeners = new Set<(state: SpotifyPlaybackState | null) => void>()

export function setPlayerVolume(volume: number) {
  sharedVolume = Math.min(1, Math.max(0, volume))

  try {
    window.localStorage.setItem(VOLUME_KEY, String(sharedVolume))
  } catch {
    // ignore quota / private mode
  }

  void sharedPlayer?.setVolume(sharedVolume)
  volumeListeners.forEach((listener) => listener(sharedVolume))
}

export function usePlayerVolume() {
  const [volume, setVolume] = useState(sharedVolume)

  useEffect(() => {
    volumeListeners.add(setVolume)
    return () => {
      volumeListeners.delete(setVolume)
    }
  }, [])

  return { volume, setVolume: setPlayerVolume }
}

async function createPlayer() {
  await loadSpotifySdk()

  if (!window.Spotify) {
    throw new Error('Spotify no está disponible en este navegador')
  }

  const player = new window.Spotify.Player({
    name: 'Vocalis',
    getOAuthToken: (cb) => {
      void SpotifyPlayerService.accessToken().then(cb)
    },
    volume: sharedVolume,
  })

  void player.activateElement?.()

  const deviceId = await new Promise<string>((resolve, reject) => {
    let settled = false

    function fail(message: string) {
      if (!settled) {
        settled = true
        reject(new Error(message))
      }
    }

    player.addListener('ready', (payload) => {
      const id = (payload as { device_id?: string }).device_id
      if (!id || settled) {
        return
      }

      settled = true
      sharedDeviceId = id
      resolve(id)
    })

    player.addListener('initialization_error', () => {
      fail('No se pudo iniciar el reproductor')
    })
    player.addListener('authentication_error', () => {
      fail('Vuelve a entrar con Spotify para reproducir')
    })
    player.addListener('account_error', () => {
      fail('Spotify Premium es necesario para reproducir')
    })
    player.addListener('player_state_changed', (payload) => {
      playbackListeners.forEach((listener) => {
        listener((payload ?? null) as SpotifyPlaybackState | null)
      })
    })

    void player.connect().then((ok) => {
      if (!ok) {
        fail('No se pudo conectar el reproductor de Spotify')
      }
    })
  })

  sharedPlayer = player
  sharedDeviceId = deviceId
  void player.setVolume(sharedVolume)
  return deviceId
}

async function ensurePlayer() {
  if (sharedPlayer && sharedDeviceId) {
    return sharedDeviceId
  }

  if (connecting) {
    return connecting
  }

  connecting = createPlayer().finally(() => {
    connecting = null
  })

  return connecting
}

async function waitForPlayingTrack(trackId: string, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const state = (await sharedPlayer?.getCurrentState()) ?? null

    if (state && stateTrackId(state) === trackId && !state.paused) {
      return state
    }

    await wait(150)
  }

  return null
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    try {
      sharedPlayer?.disconnect()
    } catch {
      // ignore
    }
  })
}

export function useSpotifyPlayer(trackId: string | undefined, durationMs = 0) {
  const [status, setStatus] = useState<PlayerStatus>('ready')
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(durationMs)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const started = useRef(false)
  const pendingRef = useRef(false)
  const trackRef = useRef(trackId)

  trackRef.current = trackId

  useEffect(() => {
    setDuration(durationMs)
  }, [durationMs])

  useEffect(() => {
    started.current = false
    pendingRef.current = false
    setPending(false)
    setPosition(0)
    setDuration(durationMs)
    setStatus('ready')
    setError(null)
    void loadSpotifySdk()
    void sharedPlayer?.pause().catch(() => undefined)

    return () => {
      void sharedPlayer?.pause().catch(() => undefined)
    }
  }, [trackId])

  useEffect(() => {
    function applyState(state: SpotifyPlaybackState | null) {
      if (!started.current || !trackRef.current) {
        return
      }

      if (!state || stateTrackId(state) !== trackRef.current) {
        return
      }

      setPosition(state.position)
      setDuration(state.duration || durationMs)
      setStatus(state.paused ? 'paused' : 'playing')
    }

    playbackListeners.add(applyState)

    const sync =
      status === 'playing' || (status === 'paused' && started.current)
        ? window.setInterval(() => {
            void sharedPlayer?.getCurrentState().then(applyState)
          }, 400)
        : null

    return () => {
      playbackListeners.delete(applyState)
      if (sync !== null) {
        window.clearInterval(sync)
      }
    }
  }, [durationMs, status])

  const toggle = useCallback(async () => {
    if (pendingRef.current || !trackRef.current) {
      return
    }

    const currentTrackId = trackRef.current
    pendingRef.current = true
    setPending(true)

    try {
      await sharedPlayer?.activateElement?.()

      if (status === 'playing' && sharedPlayer) {
        await sharedPlayer.pause()
        if (trackRef.current === currentTrackId) {
          setStatus('paused')
        }
        return
      }

      if (status === 'paused' && started.current && sharedPlayer) {
        const current = (await sharedPlayer.getCurrentState()) ?? null

        if (stateTrackId(current) === currentTrackId) {
          await sharedPlayer.resume()
          if (trackRef.current === currentTrackId) {
            setStatus('playing')
          }
          return
        }
      }

      const deviceId = await ensurePlayer()
      await sharedPlayer?.activateElement?.()
      await SpotifyPlayerService.play(currentTrackId, deviceId)

      if (trackRef.current !== currentTrackId) {
        return
      }

      const playingState = await waitForPlayingTrack(currentTrackId)

      if (trackRef.current !== currentTrackId) {
        return
      }

      started.current = true
      setError(null)

      if (playingState) {
        setPosition(playingState.position)
        setDuration(playingState.duration || durationMs)
        setStatus('playing')
        return
      }

      setPosition(0)
      setStatus('playing')
    } catch {
      if (trackRef.current === currentTrackId) {
        started.current = false
        setStatus('ready')
        setError('Spotify aún no ve este reproductor. Prueba de nuevo en un segundo.')
      }
    } finally {
      if (trackRef.current === currentTrackId) {
        pendingRef.current = false
        setPending(false)
      }
    }
  }, [durationMs, status])

  const seek = useCallback(async (positionMs: number) => {
    const currentTrackId = trackRef.current
    if (!currentTrackId || pendingRef.current) {
      return
    }

    const at = Math.max(0, Math.round(positionMs))

    if (started.current && sharedPlayer) {
      await sharedPlayer.seek(at)
      setPosition(at)
      return
    }

    pendingRef.current = true
    setPending(true)

    try {
      await sharedPlayer?.activateElement?.()
      const deviceId = await ensurePlayer()
      await sharedPlayer?.activateElement?.()
      await SpotifyPlayerService.play(currentTrackId, deviceId, at)

      if (trackRef.current !== currentTrackId) {
        return
      }

      const playingState = await waitForPlayingTrack(currentTrackId)
      if (trackRef.current !== currentTrackId) {
        return
      }

      started.current = true
      setError(null)
      setPosition(playingState?.position ?? at)
      setDuration(playingState?.duration || durationMs)
      setStatus('playing')
    } catch {
      if (trackRef.current === currentTrackId) {
        setError('No se pudo saltar a esa parte. Prueba a reproducir primero.')
      }
    } finally {
      if (trackRef.current === currentTrackId) {
        pendingRef.current = false
        setPending(false)
      }
    }
  }, [durationMs])

  return {
    status,
    position,
    duration,
    error,
    toggle,
    seek,
    busy: pending,
    loadingLabel: pending ? 'Cargando canción…' : null,
  }
}
