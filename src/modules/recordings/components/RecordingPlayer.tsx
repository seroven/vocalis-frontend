import { useEffect, useState } from 'react'
import { RecordingsService } from '../services/RecordingsService'

export const RECORDING_PLAYER_H = 36

export function RecordingPlayer({ id }: { id: number }) {
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let url: string | null = null
    let cancelled = false

    void RecordingsService.audio(id)
      .then((blob) => {
        if (cancelled) {
          return
        }
        url = URL.createObjectURL(blob)
        setSrc(url)
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
        }
      })

    return () => {
      cancelled = true
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [id])

  return (
    <div className="recording-audio-slot">
      {error ? (
        <p className="text-sm leading-9 text-stage-muted">No se pudo cargar el audio.</p>
      ) : src ? (
        <audio className="recording-audio w-full" controls src={src} preload="metadata">
          Tu navegador no puede reproducir esta grabación.
        </audio>
      ) : (
        <span className="recording-audio-slot-busy" />
      )}
    </div>
  )
}
