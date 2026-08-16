import { Music2 } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { cx } from '../../../shared/lib/cx'
import type { LyricLine } from '../interfaces/lyrics-sync.interface'
import {
  activeLyricCue,
  buildLyricCues,
  isPastLyricLine,
} from '../interfaces/lyrics-sync.interface'
import { keepLineCentered } from '../lib/keep-line-centered'

export function LyricsKaraoke({
  lines,
  position,
  follow = true,
}: {
  lines: LyricLine[]
  position?: number
  follow?: boolean
}) {
  const at = position ?? -1
  const active = follow ? activeLyricCue(lines, at) : null
  const cues = useMemo(() => buildLyricCues(lines), [lines])
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLElement | null>(null)
  const activeKey =
    active?.kind === 'line' ? `line-${active.index}` : active?.id ?? null

  useEffect(() => {
    if (!follow || !activeKey) {
      return
    }

    keepLineCentered(scrollerRef.current, activeRef.current)
  }, [activeKey, at, follow])

  return (
    <div
      ref={follow ? scrollerRef : undefined}
      className={follow ? 'app-scroll min-h-0 flex-1 px-4' : 'mt-10 px-2'}
    >
      <div
        className={cx(
          'mx-auto flex w-full max-w-3xl flex-col items-center gap-5',
          follow && 'py-[38vh]',
        )}
      >
        {cues.map((cue) => {
          if (cue.kind === 'gap') {
            if (!follow) {
              return null
            }

            const isActive = active?.kind === 'gap' && active.id === cue.id

            return (
              <div
                key={cue.id}
                ref={isActive ? activeRef : undefined}
                className={cx(
                  'grid place-items-center transition-all duration-300',
                  isActive ? 'text-accent' : 'text-stage-muted/45',
                )}
                aria-label="Instrumental"
              >
                <Music2 size={isActive ? 40 : 26} strokeWidth={isActive ? 2.1 : 1.5} />
              </div>
            )
          }

          const line = lines[cue.index]
          const isActive = active?.kind === 'line' && active.index === cue.index
          const isPast = follow && isPastLyricLine(cue.index, lines, at, active)

          return (
            <p
              key={`line-${cue.index}`}
              ref={isActive ? activeRef : undefined}
              className={cx(
                'text-center transition-all duration-300',
                isActive
                  ? 'font-display text-4xl text-stage-fg md:text-5xl'
                  : isPast
                    ? 'text-xl text-stage-muted/55'
                    : 'text-xl text-stage-muted',
              )}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </div>
  )
}
