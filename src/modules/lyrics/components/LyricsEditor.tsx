import { AnimatePresence, motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../shared/lib/cx'
import { Button } from '../../../shared/components/Button'
import type { PlayerSession } from '../../player/interfaces/player.interface'
import type { LyricLine } from '../interfaces/lyrics-sync.interface'
import {
  isSyncComplete,
  nextLineIndex,
  singingIndex,
} from '../interfaces/lyrics-sync.interface'
import { keepLineCentered } from '../lib/keep-line-centered'
import { LyricsTimeline } from './LyricsTimeline'

type MarkFlash = 'space-start' | 'space-next' | 'enter-stop' | 'undo'

const flashCopy: Record<MarkFlash, string> = {
  'space-start': 'Espacio · empieza a cantar',
  'space-next': 'Espacio · siguiente línea',
  'enter-stop': 'Enter · cortar',
  undo: 'Backspace · deshacer',
}

function cloneLines(lines: LyricLine[]) {
  return lines.map((line) => ({ ...line }))
}

export function LyricsEditor({
  lines,
  position,
  duration,
  player,
  saving,
  onChange,
  onSave,
}: {
  lines: LyricLine[]
  position: number
  duration: number
  player: PlayerSession
  saving: boolean
  onChange: (lines: LyricLine[]) => void
  onSave: () => void
}) {
  const historyRef = useRef<LyricLine[][]>([])
  const linesRef = useRef(lines)
  const positionRef = useRef(position)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLParagraphElement | null>(null)
  const [flash, setFlash] = useState<MarkFlash | null>(null)
  const flashTimer = useRef<number | null>(null)

  linesRef.current = lines
  positionRef.current = position

  const current = singingIndex(lines)
  const upcoming = nextLineIndex(lines)
  const complete = isSyncComplete(lines)
  const hintIndex = current >= 0 ? current : upcoming
  const singing = current >= 0

  function showFlash(kind: MarkFlash) {
    setFlash(kind)
    if (flashTimer.current !== null) {
      window.clearTimeout(flashTimer.current)
    }
    flashTimer.current = window.setTimeout(() => setFlash(null), 900)
  }

  function commit(next: LyricLine[]) {
    historyRef.current.push(cloneLines(linesRef.current))
    onChange(next)
  }

  function undo() {
    const previous = historyRef.current.pop()
    if (previous) {
      onChange(previous)
      showFlash('undo')
    }
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return
      }

      const at = positionRef.current
      const currentLines = linesRef.current
      const singingAt = singingIndex(currentLines)
      const next = nextLineIndex(currentLines)

      if (event.key === 'Backspace') {
        event.preventDefault()
        undo()
        return
      }

      if (event.key === ' ') {
        event.preventDefault()

        if (singingAt < 0) {
          if (next < 0) {
            return
          }

          showFlash('space-start')
          commit(
            currentLines.map((line, index) =>
              index === next ? { ...line, startMs: at } : line,
            ),
          )
          return
        }

        const closed = currentLines.map((line, index) =>
          index === singingAt ? { ...line, endMs: at } : line,
        )
        const upcoming = nextLineIndex(closed)

        showFlash('space-next')

        if (upcoming < 0) {
          commit(closed)
          return
        }

        commit(
          closed.map((line, index) =>
            index === upcoming ? { ...line, startMs: at } : line,
          ),
        )
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()

        if (singingAt < 0) {
          return
        }

        showFlash('enter-stop')
        commit(
          currentLines.map((line, index) =>
            index === singingAt ? { ...line, endMs: at } : line,
          ),
        )
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onChange])

  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) {
        window.clearTimeout(flashTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    const line = activeLineRef.current
    if (!scroller || hintIndex < 0 || !line) {
      return
    }

    keepLineCentered(scroller, line)
  }, [hintIndex, singing, position])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex justify-center">
        <p
          className={cx(
            'rounded-full px-4 py-1.5 text-sm font-semibold',
            singing ? 'bg-accent text-accent-fg' : 'bg-stage-fg/10 text-stage-muted',
          )}
        >
          {singing
            ? 'Cantando · Espacio cambia de línea · Enter corta'
            : 'Pausa · Espacio empieza la siguiente línea'}
        </p>
      </div>

      <div ref={scrollerRef} className="app-scroll relative min-h-0 flex-1 px-4">
        <AnimatePresence>
          {flash ? (
            <motion.div
              key={flash}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className={cx(
                'pointer-events-none absolute top-2 z-10 rounded-full px-4 py-2 text-sm font-semibold shadow-lg',
                flash === 'space-start' || flash === 'space-next'
                  ? 'bg-accent text-accent-fg'
                  : flash === 'enter-stop'
                    ? 'bg-stage-fg text-stage'
                    : 'bg-stage-fg/20 text-stage-fg',
              )}
            >
              {flashCopy[flash]}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-3 py-[30vh]">
        {lines.map((line, index) => {
          const active = index === hintIndex
          const done = line.startMs != null && line.endMs != null

          return (
            <p
              key={`${line.text}-${index}`}
              ref={active ? activeLineRef : undefined}
              className={cx(
                'mx-auto w-full text-center transition-all duration-200',
                active && singing && 'font-display text-3xl text-accent md:text-4xl',
                active && !singing && 'font-display text-3xl text-stage-fg md:text-4xl',
                !active && done && 'text-lg text-stage-muted/70',
                !active && !done && 'text-lg text-stage-muted',
              )}
            >
              {line.text}
            </p>
          )
        })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stage-muted">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-fg">
            Espacio
          </span>
          <span
            className={cx(
              'rounded-full px-3 py-1 font-semibold',
              singing ? 'bg-stage-fg text-stage' : 'bg-stage-fg/10',
            )}
          >
            Enter
          </span>
          <span className="rounded-full bg-stage-fg/10 px-3 py-1 font-semibold">
            Backspace
          </span>
        </div>
        <Button onClick={() => void onSave()} disabled={saving}>
          <Save size={18} />
          {saving ? 'Guardando…' : complete ? 'Guardar sincronización' : 'Guardar avance'}
        </Button>
      </div>

      <LyricsTimeline
        lines={lines}
        position={position}
        duration={duration || player.duration}
        onChange={onChange}
        onSeek={(ms) => void player.seek(ms)}
        onHistory={() => {
          historyRef.current.push(cloneLines(linesRef.current))
        }}
      />
    </div>
  )
}
