import { Loader2, Pause, Play } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Button } from '../../../shared/components/Button'
import type { TrackDetail } from '../../home/interfaces/search.interface'
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer'

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function TrackPlayer({ track }: { track: TrackDetail }) {
  const { status, position, duration, error, toggle, seek, busy, loadingLabel } =
    useSpotifyPlayer(track.id, track.durationMs ?? 0)
  const playing = status === 'playing'
  const max = duration || track.durationMs || 0
  const progress = max > 0 ? Math.min(100, (position / max) * 100) : 0

  return (
    <div className="panel mt-8 flex items-center gap-4 rounded-[1.6rem] p-3.5 text-left md:p-4">
      <div className="catalog-cover is-release h-14 w-14 shrink-0 md:h-16 md:w-16">
        {track.imageUrl ? (
          <img src={track.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-xl text-accent">
            {track.title.trim().charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>

      <Button
        variant="icon"
        className="player-play h-11 w-11 shrink-0"
        aria-label={busy ? 'Cargando' : playing ? 'Pausar' : 'Reproducir'}
        aria-busy={busy}
        disabled={busy || status === 'error'}
        onClick={() => void toggle()}
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : playing ? (
          <Pause size={18} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play size={18} fill="currentColor" strokeWidth={0} className="translate-x-px" />
        )}
      </Button>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <input
          className="player-range"
          type="range"
          min={0}
          max={max || 1}
          value={Math.min(position, max)}
          disabled={!max || status === 'ready' || status === 'connecting' || status === 'error'}
          aria-label="Progreso"
          style={
            {
              '--player-progress': `linear-gradient(to right, var(--app-accent) ${progress}%, color-mix(in srgb, var(--app-stage-fg) 16%, transparent) ${progress}%)`,
            } as CSSProperties
          }
          onChange={(event) => void seek(Number(event.target.value))}
        />
        <div className="flex justify-between text-[0.7rem] leading-none text-stage-muted">
          <span>{formatTime(position)}</span>
          <span>{formatTime(max)}</span>
        </div>
        {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        {loadingLabel ? <p className="text-xs text-stage-muted">{loadingLabel}</p> : null}
      </div>
    </div>
  )
}
