import { AnimatePresence, motion } from 'framer-motion'
import { Check, Circle, Mic, Pause, Play, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { pageEase } from '../../../shared/lib/page-motion'
import type { RecordingItem } from '../interfaces/recording.interface'
import { useMicDevice } from '../MicDeviceContext'
import { RecordingsService } from '../services/RecordingsService'
import { RecordingPlayer } from './RecordingPlayer'
import { RecordingTitle } from './RecordingTitle'

type Status = 'idle' | 'recording' | 'paused' | 'saving'

function pickMime() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

function audioConstraints(deviceId: string | null): MediaTrackConstraints {
  return {
    ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 1,
  }
}

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function RecordingMenu({
  track,
}: {
  track: {
    id: string
    title: string
    artistName: string
    imageUrl: string | null
  }
}) {
  const { deviceId } = useMicDevice()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [takes, setTakes] = useState<RecordingItem[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const active = status === 'recording' || status === 'paused' || status === 'saving'

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (status !== 'recording') {
      return
    }

    const started = Date.now() - elapsed
    const timer = window.setInterval(() => {
      setElapsed(Date.now() - started)
    }, 200)
    return () => window.clearInterval(timer)
    // elapsed se captura al pasar a grabando o reanudar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    return () => {
      recorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void RecordingsService.list(track.id)
      .then((response) => {
        if (!cancelled) {
          setTakes(response.data.items[0]?.recordings ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTakes([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [track.id])

  async function start() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints(deviceId),
      })
      const [mic] = stream.getAudioTracks()
      if (mic) {
        await mic.applyConstraints(audioConstraints(deviceId)).catch(() => undefined)
      }
      const mime = pickMime()
      const recorder = new MediaRecorder(stream, {
        ...(mime ? { mimeType: mime } : {}),
        audioBitsPerSecond: 192_000,
      })
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      streamRef.current = stream
      recorderRef.current = recorder
      recorder.start()
      setElapsed(0)
      setStatus('recording')
    } catch {
      setError('No se pudo usar el micrófono. Elige otro en la barra superior.')
    }
  }

  function pause() {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause()
      setStatus('paused')
    }
  }

  function resume() {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume()
      setStatus('recording')
    }
  }

  async function finish() {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      return
    }

    setStatus('saving')
    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }))
      }
      recorder.stop()
    })
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null

    if (elapsed < 400 || blob.size < 200) {
      setStatus('idle')
      setElapsed(0)
      setError('La toma es demasiado corta.')
      return
    }

    try {
      const saved = await RecordingsService.create({
        audio: blob,
        spotifyId: track.id,
        trackTitle: track.title,
        artistName: track.artistName,
        imageUrl: track.imageUrl,
        durationMs: elapsed,
      })
      setTakes((current) => [saved.data, ...current])
      setError(null)
    } catch {
      setError('No se pudo guardar la grabación.')
    } finally {
      setStatus('idle')
      setElapsed(0)
    }
  }

  const label =
    status === 'recording'
      ? 'Grabando'
      : status === 'paused'
        ? 'En pausa'
        : status === 'saving'
          ? 'Guardando'
          : 'Lista para grabar'

  return (
    <div className="relative z-80" ref={panelRef}>
      <Button
        variant="icon"
        aria-label="Grabación"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={active || open ? 'text-accent' : undefined}
      >
        <Mic size={18} className={status === 'recording' ? 'animate-pulse' : undefined} />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: pageEase }}
            className="panel panel-float absolute top-[calc(100%+10px)] right-0 z-80 flex max-h-[min(24rem,calc(100svh-10rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[1.6rem] text-left"
          >
            <div className="shrink-0 px-5 pt-4">
              <p className="text-xs tracking-[0.16em] text-accent uppercase">Grabación</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="font-semibold text-stage-fg">{label}</p>
                  <p className="text-sm text-stage-muted">Se guarda en Mis grabaciones.</p>
                </div>
                <p className="font-display text-2xl tabular-nums text-stage-fg">
                  {formatMs(elapsed)}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {status === 'idle' || status === 'saving' ? (
                  <Button onClick={() => void start()} disabled={status === 'saving'}>
                    <Circle size={16} fill="currentColor" />
                    Empezar
                  </Button>
                ) : null}
                {status === 'recording' ? (
                  <Button variant="ghost" className="w-auto" onClick={pause}>
                    <Pause size={16} />
                    Parar
                  </Button>
                ) : null}
                {status === 'paused' ? (
                  <Button variant="ghost" className="w-auto" onClick={resume}>
                    <Play size={16} />
                    Reanudar
                  </Button>
                ) : null}
                {status === 'recording' || status === 'paused' ? (
                  <Button onClick={() => void finish()}>
                    <Check size={16} />
                    Terminar
                  </Button>
                ) : null}
              </div>
              {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
            </div>

            <div className="app-scroll mt-4 min-h-0 flex-1 border-t border-line/60 px-5 pt-4 pb-4">
              <p className="text-xs tracking-[0.16em] text-accent uppercase">
                Tomas de esta canción
              </p>
              {takes.length === 0 ? (
                <p className="mt-3 text-sm text-stage-muted">
                  Aún no hay grabaciones aquí.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {takes.map((take, index) => (
                    <li key={take.id} className="rounded-2xl bg-stage-fg/5 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <RecordingTitle
                            take={take}
                            fallback={`Toma ${index + 1}`}
                            onRenamed={(title) =>
                              setTakes((current) =>
                                current.map((item) =>
                                  item.id === take.id ? { ...item, title } : item,
                                ),
                              )
                            }
                          />
                          <p className="mt-0.5 text-sm text-stage-muted">
                            {formatDate(take.createdAt)} · {formatMs(take.durationMs)}
                          </p>
                        </div>
                        <Button
                          variant="icon"
                          aria-label="Borrar toma"
                          className="h-9 w-9"
                          onClick={() => {
                            void RecordingsService.remove(take.id).then(() => {
                              setTakes((current) => current.filter((item) => item.id !== take.id))
                            })
                          }}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                      <div className="mt-3">
                        <RecordingPlayer id={take.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
