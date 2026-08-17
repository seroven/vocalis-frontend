import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../shared/components/Button'
import { pageMotion } from '../../../shared/lib/page-motion'
import type { TrackDetail } from '../../home/interfaces/search.interface'
import { TrackPlayer } from '../../player/components/TrackPlayer'
import type { PlayerSession } from '../../player/interfaces/player.interface'
import type { LyricLine } from '../interfaces/lyrics-sync.interface'
import { isSyncComplete, splitLyricLines } from '../interfaces/lyrics-sync.interface'
import { LyricsSyncService } from '../services/LyricsSyncService'
import { useSmoothPosition } from '../hooks/useSmoothPosition'
import { useLyricMarks } from '../../tags/hooks/useTags'
import { RecordingMenu } from '../../recordings/components/RecordingMenu'
import { LyricsEditor } from './LyricsEditor'
import { LyricsKaraoke } from './LyricsKaraoke'

export function FocusMode({
  track,
  lyrics,
  player,
  onClose,
}: {
  track: TrackDetail
  lyrics: string
  player: PlayerSession
  onClose: () => void
}) {
  const [lines, setLines] = useState<LyricLine[]>([])
  const [source, setSource] = useState<'global' | 'user' | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { marks } = useLyricMarks(track.id)
  const complete = isSyncComplete(lines)
  const showEditor = editing
  const duration = player.duration || track.durationMs || 0
  const smoothPosition = useSmoothPosition(
    player.position,
    player.status === 'playing',
    duration,
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void LyricsSyncService.get(track.id)
      .then((response) => {
        if (cancelled) {
          return
        }

        const saved = response.data.lines
        setSource(response.data.source)
        setLines(saved.length > 0 ? saved : splitLyricLines(lyrics))
        setEditing(!response.data.complete)
      })
      .catch(() => {
        if (!cancelled) {
          setLines(splitLyricLines(lyrics))
          setEditing(true)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [lyrics, track.id])

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      const response = await LyricsSyncService.save(track.id, lines, {
        title: track.title,
        subtitle: track.subtitle,
        imageUrl: track.imageUrl,
      })
      setLines(response.data.lines)
      setSource('user')
      setEditing(false)
    } catch {
      setError('No se pudo guardar la sincronización.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <motion.div
      {...pageMotion}
      className="absolute inset-0 z-20 flex flex-col py-5 text-stage-fg md:py-6"
    >
      <div className="app-width flex shrink-0 items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.18em] text-accent uppercase">Focus</p>
          <h2 className="truncate font-display text-xl">{track.title}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <RecordingMenu
            track={{
              id: track.id,
              title: track.title,
              artistName: track.artistName,
              imageUrl: track.imageUrl,
            }}
          />
          {!showEditor && source !== 'global' ? (
            <Button
              variant="icon"
              aria-label="Editar sincronización"
              onClick={() => setEditing(true)}
            >
              <Pencil size={18} />
            </Button>
          ) : null}
          <Button variant="icon" aria-label="Salir del focus" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
      </div>

      <div className="app-width flex min-h-0 flex-1 flex-col pt-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.p
              key="loading"
              {...pageMotion}
              className="m-auto text-stage-muted"
            >
              Preparando focus…
            </motion.p>
          ) : (
            <motion.div
              key={showEditor ? 'editor' : 'karaoke'}
              {...pageMotion}
              className="flex min-h-0 flex-1 flex-col"
            >
              {showEditor ? (
                <LyricsEditor
                  lines={lines}
                  position={smoothPosition}
                  duration={duration}
                  player={player}
                  saving={saving}
                  onChange={setLines}
                  onSave={() => void handleSave()}
                />
              ) : (
                <LyricsKaraoke
                  lines={lines}
                  position={smoothPosition}
                  marks={marks}
                  onSeek={player.seek}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error ? (
        <p className="app-width mt-3 shrink-0 text-sm text-rose-400">{error}</p>
      ) : null}

      <div className="app-width mt-4 shrink-0">
        <TrackPlayer track={track} player={player} compact />
      </div>
    </motion.div>,
    document.getElementById('app-stage') ?? document.body,
  )
}
