import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { cx } from '../../../shared/lib/cx'
import type { LyricLine } from '../interfaces/lyrics-sync.interface'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function LyricsTimeline({
  lines,
  position,
  duration,
  onChange,
  onSeek,
  onHistory,
}: {
  lines: LyricLine[]
  position: number
  duration: number
  onChange: (lines: LyricLine[]) => void
  onSeek: (positionMs: number) => void
  onHistory?: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const max = Math.max(duration, 1)
  const width = Math.max(720, Math.round(max / 1000) * 56)
  const playhead = (position / max) * width

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }

    const view = scroller.clientWidth
    const maxScroll = Math.max(0, scroller.scrollWidth - view)
    const target =
      playhead < view / 2 ? 0 : Math.min(maxScroll, playhead - view / 2)

    scroller.scrollLeft = target
  }, [playhead, width])

  function msFromEvent(clientX: number) {
    const track = trackRef.current
    if (!track) {
      return 0
    }

    const rect = track.getBoundingClientRect()
    const x = clientX - rect.left
    return clamp(Math.round((x / rect.width) * max), 0, max)
  }

  function updateLine(index: number, startMs: number, endMs: number) {
    const prevEnd = index > 0 ? lines[index - 1]?.endMs : 0
    const nextStart = index < lines.length - 1 ? lines[index + 1]?.startMs : max
    const minStart = prevEnd ?? 0
    const maxEnd = nextStart ?? max
    const nextStartMs = clamp(startMs, minStart, Math.max(minStart, endMs - 80))
    const nextEndMs = clamp(endMs, nextStartMs + 80, maxEnd)

    onChange(
      lines.map((line, current) =>
        current === index ? { ...line, startMs: nextStartMs, endMs: nextEndMs } : line,
      ),
    )
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    index: number,
    kind: 'move' | 'start' | 'end',
  ) {
    event.preventDefault()
    event.stopPropagation()
    const line = lines[index]
    if (line.startMs == null || line.endMs == null) {
      return
    }

    onHistory?.()

    const origin = msFromEvent(event.clientX)
    const startMs = line.startMs
    const endMs = line.endMs
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)

    function onMove(moveEvent: PointerEvent) {
      const at = msFromEvent(moveEvent.clientX)
      const delta = at - origin

      if (kind === 'move') {
        updateLine(index, startMs + delta, endMs + delta)
        return
      }

      if (kind === 'start') {
        updateLine(index, startMs + delta, endMs)
        return
      }

      updateLine(index, startMs, endMs + delta)
    }

    function onUp() {
      target.releasePointerCapture(event.pointerId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const gaps: Array<{ left: number; width: number }> = []
  const timed = lines.filter(
    (line): line is LyricLine & { startMs: number; endMs: number } =>
      line.startMs != null && line.endMs != null,
  )

  for (let index = 0; index < timed.length; index += 1) {
    const start = index === 0 ? 0 : timed[index - 1].endMs
    const end = timed[index].startMs
    if (end - start > 120) {
      gaps.push({
        left: (start / max) * width,
        width: ((end - start) / max) * width,
      })
    }
  }

  return (
    <div
      ref={scrollerRef}
      className="lyrics-timeline app-scroll-x rounded-2xl"
    >
      <div
        ref={trackRef}
        className="relative h-24"
        style={{ width }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onSeek(msFromEvent(event.clientX))
          }
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-stage-fg/10" />
        {gaps.map((gap) => (
          <div
            key={`${gap.left}-${gap.width}`}
            className="lyrics-gap absolute top-3 h-18 rounded-xl"
            style={{ left: gap.left, width: gap.width }}
            title="Instrumental"
          />
        ))}
        {lines.map((line, index) => {
          if (line.startMs == null) {
            return null
          }

          const live = line.endMs == null
          const endMs = live ? Math.max(position, line.startMs + 60) : line.endMs
          const previous = [...timed]
            .reverse()
            .find((item) => item.endMs <= line.startMs!)
          const joined = previous != null && line.startMs - previous.endMs <= 120
          const left = (line.startMs / max) * width
          const blockWidth = Math.max(12, ((endMs - line.startMs) / max) * width)

          if (live) {
            return (
              <div
                key={`${line.text}-${index}`}
                className={cx(
                  'lyrics-block lyrics-block-live pointer-events-none absolute top-3 flex h-18 overflow-hidden',
                  joined ? 'rounded-r-xl' : 'rounded-xl',
                )}
                style={{ left, width: blockWidth }}
                title={line.text}
              >
                <span className="min-w-0 flex-1 truncate px-2 py-1 text-left text-[0.65rem] leading-tight text-accent-fg">
                  {line.text}
                </span>
              </div>
            )
          }

          return (
            <div
              key={`${line.text}-${index}`}
              className={cx(
                'lyrics-block absolute top-3 flex h-18 overflow-hidden',
                joined ? 'rounded-lg' : 'rounded-xl lyrics-block-start',
              )}
              style={{ left, width: blockWidth }}
              title={line.text}
            >
              <button
                type="button"
                className="h-full w-2 shrink-0 cursor-ew-resize bg-black/15"
                aria-label="Inicio de la línea"
                onPointerDown={(event) => handlePointerDown(event, index, 'start')}
              />
              <button
                type="button"
                className="min-w-0 flex-1 truncate px-1 text-left text-[0.65rem] leading-tight text-accent-fg"
                onPointerDown={(event) => handlePointerDown(event, index, 'move')}
              >
                {line.text}
              </button>
              <button
                type="button"
                className="h-full w-2 shrink-0 cursor-ew-resize bg-black/15"
                aria-label="Final de la línea"
                onPointerDown={(event) => handlePointerDown(event, index, 'end')}
              />
            </div>
          )
        })}
        <div
          className="lyrics-playhead pointer-events-none absolute top-0 bottom-0"
          style={{ transform: `translateX(${playhead}px)` }}
        />
      </div>
    </div>
  )
}
