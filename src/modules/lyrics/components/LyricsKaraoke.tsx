import { LocateFixed, Music2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { cx } from '../../../shared/lib/cx'
import { TaggedLyricText } from '../../tags/components/TaggedLyricText'
import type { LyricTagMark, Tag, TagTarget } from '../../tags/interfaces/tag.interface'
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
  marks = [],
  tags = [],
  editing = false,
  onApplyTag,
  onRemoveTag,
  onTagCreated,
  onSeek,
  target,
}: {
  lines: LyricLine[]
  position?: number
  follow?: boolean
  marks?: LyricTagMark[]
  tags?: Tag[]
  editing?: boolean
  onApplyTag?: (lineIndex: number, start: number, end: number, excerpt: string, tagId: number) => void
  onRemoveTag?: (markId: number) => void
  onTagCreated?: (tag: Tag) => void
  onSeek?: (positionMs: number) => void
  target?: TagTarget
}) {
  const at = position ?? -1
  const active = follow ? activeLyricCue(lines, at) : null
  const cues = useMemo(() => buildLyricCues(lines), [lines])
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLElement | null>(null)
  const ignoreScroll = useRef(false)
  const [synced, setSynced] = useState(true)
  const activeKey =
    active?.kind === 'line' ? `line-${active.index}` : active?.id ?? null

  function centerActive(smooth = false) {
    const scroller = scrollerRef.current
    const line = activeRef.current
    if (!scroller || !line) {
      return
    }

    ignoreScroll.current = true
    if (smooth) {
      const view = scroller.getBoundingClientRect()
      const target = line.getBoundingClientRect()
      scroller.scrollTo({
        top: scroller.scrollTop + (target.top + target.height / 2 - (view.top + view.height / 2)),
        behavior: 'smooth',
      })
    } else {
      keepLineCentered(scroller, line)
    }

    window.setTimeout(() => {
      ignoreScroll.current = false
    }, smooth ? 450 : 80)
  }

  useEffect(() => {
    if (!follow || !activeKey || !synced) {
      return
    }

    centerActive(true)
  }, [activeKey, follow, synced])

  function handleSeek(positionMs: number | null) {
    if (positionMs == null || !onSeek) {
      return
    }

    onSeek(positionMs)
    setSynced(true)
  }

  return (
    <div className={follow ? 'relative min-h-0 flex-1' : undefined}>
      <div
        ref={follow ? scrollerRef : undefined}
        className={follow ? 'app-scroll absolute inset-0 px-4' : 'mt-10 px-2'}
        onScroll={
          follow
            ? () => {
                if (!ignoreScroll.current) {
                  setSynced(false)
                }
              }
            : undefined
        }
      >
        <div
          className={cx(
            'mx-auto flex w-full flex-col items-center gap-5',
            follow && 'py-[38vh]',
          )}
        >
          {cues.map((cue) => {
            if (cue.kind === 'gap') {
              if (!follow) {
                return null
              }

              const isActive = active?.kind === 'gap' && active.id === cue.id
              const gapStart = lines[cue.afterIndex]?.endMs ?? null

              return (
                <button
                  key={cue.id}
                  type="button"
                  ref={isActive ? activeRef : undefined}
                  className={cx(
                    'grid place-items-center transition-all duration-300',
                    isActive ? 'text-accent' : 'text-stage-muted/45',
                    onSeek && gapStart != null && 'cursor-pointer hover:text-accent',
                  )}
                  aria-label="Instrumental"
                  onClick={() => handleSeek(gapStart)}
                >
                  <Music2 size={isActive ? 40 : 26} strokeWidth={isActive ? 2.1 : 1.5} />
                </button>
              )
            }

            const line = lines[cue.index]
            const isActive = active?.kind === 'line' && active.index === cue.index
            const isPast = follow && isPastLyricLine(cue.index, lines, at, active)
            const canSeek = Boolean(onSeek && line.startMs != null)

            return (
              <p
                key={`line-${cue.index}`}
                ref={isActive ? activeRef : undefined}
                role={canSeek ? 'button' : undefined}
                tabIndex={canSeek ? 0 : undefined}
                className={cx(
                  'text-center transition-all duration-300',
                  isActive
                    ? 'font-display text-4xl text-stage-fg md:text-5xl'
                    : isPast
                      ? 'text-xl text-stage-muted/55'
                      : 'text-xl text-stage-muted',
                  canSeek && 'cursor-pointer hover:text-stage-fg',
                )}
                onClick={() => handleSeek(line.startMs)}
                onKeyDown={
                  canSeek
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleSeek(line.startMs)
                        }
                      }
                    : undefined
                }
              >
                <TaggedLyricText
                  text={line.text}
                  marks={marks.filter((mark) => mark.lineIndex === cue.index)}
                  tags={tags}
                  editing={editing}
                  onApply={
                    onApplyTag
                      ? (start, end, excerpt, tagId) =>
                          onApplyTag(cue.index, start, end, excerpt, tagId)
                      : undefined
                  }
                  onRemove={onRemoveTag}
                  onTagCreated={onTagCreated}
                  target={target}
                />
              </p>
            )
          })}
        </div>
      </div>

      {follow && !synced ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
          <Button
            className="pointer-events-auto shadow-lg"
            onClick={() => {
              setSynced(true)
              requestAnimationFrame(() => centerActive(true))
            }}
          >
            <LocateFixed size={18} />
            Sincronizar
          </Button>
        </div>
      ) : null}
    </div>
  )
}
