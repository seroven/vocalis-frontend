import { useCallback, useEffect, useRef, useState } from 'react'
import type { PlayerStatus } from '../interfaces/player.interface'
import { loadSpotifySdk, type SpotifyPlayer } from '../lib/spotifySdk'
import { SpotifyPlayerService } from '../services/SpotifyPlayerService'

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
let uses = 0
let releaseTimer: number | null = null
let connectGeneration = 0
let sharedVolume = readStoredVolume()
const volumeListeners = new Set<(volume: number) => void>()

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

async function connectPlayer() {
  if (sharedDeviceId && sharedPlayer) {
    return sharedDeviceId
  }

  if (connecting) {
    return connecting
  }

  const generation = connectGeneration + 1
  connectGeneration = generation

  connecting = (async () => {
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

      void player.connect().then((ok) => {
        if (!ok) {
          fail('No se pudo conectar el reproductor de Spotify')
        }
      })
    })

    if (generation !== connectGeneration) {
      player.disconnect()
      throw new Error('El reproductor se reconectó')
    }

    sharedPlayer = player
    sharedDeviceId = deviceId
    void player.setVolume(sharedVolume)
    return deviceId
  })().finally(() => {
    connecting = null
  })

  return connecting
}

function acquirePlayer() {
  uses += 1

  if (releaseTimer !== null) {
    window.clearTimeout(releaseTimer)
    releaseTimer = null
  }

  return connectPlayer()
}

function releasePlayer() {
  uses = Math.max(0, uses - 1)

  if (uses > 0) {
    return
  }

  releaseTimer = window.setTimeout(() => {
    releaseTimer = null

    if (uses > 0) {
      return
    }

    connectGeneration += 1
    sharedPlayer?.disconnect()
    sharedPlayer = null
    sharedDeviceId = null
    connecting = null
  }, 1000)
}

export function useSpotifyPlayer(trackId: string | undefined, durationMs = 0) {
  const [status, setStatus] = useState<PlayerStatus>('connecting')
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
    let cancelled = false
    started.current = false
    pendingRef.current = false
    setPending(false)
    setPosition(0)
    setStatus('connecting')
    setError(null)

    void acquirePlayer()
      .then((deviceId) => {
        if (!cancelled && deviceId) {
          setStatus('ready')
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setStatus('error')
          setError(
            reason instanceof Error ? reason.message : 'No se pudo abrir el reproductor',
          )
        }
      })

    return () => {
      cancelled = true
      releasePlayer()
    }
  }, [trackId])

  useEffect(() => {
    if (status !== 'playing') {
      return
    }

    const timer = window.setInterval(() => {
      void sharedPlayer?.getCurrentState().then((state) => {
        if (!state) {
          return
        }

        setPosition(state.position)
        setDuration(state.duration || durationMs)
        setStatus(state.paused ? 'paused' : 'playing')
      })
    }, 400)

    return () => window.clearInterval(timer)
  }, [durationMs, status])

  const toggle = useCallback(async () => {
    if (
      pendingRef.current ||
      !trackRef.current ||
      !sharedDeviceId ||
      !sharedPlayer
    ) {
      return
    }

    const trackId = trackRef.current
    pendingRef.current = true
    setPending(true)

    try {
      await sharedPlayer.activateElement?.()

      if (status === 'playing') {
        await sharedPlayer.pause()
        if (trackRef.current === trackId) {
          setStatus('paused')
        }
        return
      }

      if (status === 'paused' && started.current) {
        await sharedPlayer.resume()
        if (trackRef.current === trackId) {
          setStatus('playing')
        }
        return
      }

      await SpotifyPlayerService.play(trackId, sharedDeviceId)

      if (trackRef.current !== trackId) {
        return
      }

      started.current = true
      setStatus('playing')
      setError(null)
    } catch {
      if (trackRef.current === trackId) {
        setStatus('ready')
        setError('Spotify aún no ve este reproductor. Prueba de nuevo en un segundo.')
      }
    } finally {
      if (trackRef.current === trackId) {
        pendingRef.current = false
        setPending(false)
      }
    }
  }, [status])

  const seek = useCallback(async (positionMs: number) => {
    if (!started.current || !sharedPlayer) {
      return
    }

    await sharedPlayer.seek(positionMs)
    setPosition(positionMs)
  }, [])

  return {
    status,
    position,
    duration,
    error,
    toggle,
    seek,
    busy: status === 'connecting' || pending,
    loadingLabel:
      status === 'connecting'
        ? 'Conectando Spotify…'
        : pending && status === 'ready'
          ? 'Cargando canción…'
          : null,
  }
}
