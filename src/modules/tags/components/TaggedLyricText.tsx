import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Button } from '../../../shared/components/Button'
import { cx } from '../../../shared/lib/cx'
import { pageEase } from '../../../shared/lib/page-motion'
import { TAG_COLOR_CSS, type LyricTagMark, type Tag, type TagTarget } from '../interfaces/tag.interface'
import { lyricSegments } from '../lib/lyric-segments'
import { TagChip } from './TagChip'
import { TagForm } from './TagForm'

type Anchor = {
  start: number
  end: number
  excerpt: string
  x: number
  top: number
  bottom: number
}

type PanelBox = {
  left: number
  top: number
  placement: 'above' | 'below'
}

function placePanel(anchor: Anchor, width: number, height: number): PanelBox {
  const stage = document.getElementById('app-stage')?.getBoundingClientRect()
  const margin = 12
  const minX = (stage?.left ?? 0) + margin
  const maxX = (stage?.right ?? window.innerWidth) - margin
  const minY = (stage?.top ?? 0) + margin
  const maxY = (stage?.bottom ?? window.innerHeight) - margin

  const left = Math.min(Math.max(anchor.x - width / 2, minX), Math.max(minX, maxX - width))
  const above = anchor.top - height - 10
  const below = anchor.bottom + 10
  const fitsAbove = above >= minY
  const fitsBelow = below + height <= maxY

  if (fitsAbove || (!fitsBelow && anchor.top > (minY + maxY) / 2)) {
    return { left, top: Math.max(minY, above), placement: 'above' }
  }

  return { left, top: Math.min(below, Math.max(minY, maxY - height)), placement: 'below' }
}

export function TaggedLyricText({
  text,
  marks,
  tags,
  editing = false,
  onApply,
  onRemove,
  onTagCreated,
  target,
}: {
  text: string
  marks: LyricTagMark[]
  tags?: Tag[]
  editing?: boolean
  onApply?: (start: number, end: number, excerpt: string, tagId: number) => void
  onRemove?: (markId: number) => void
  onTagCreated?: (tag: Tag) => void
  target?: TagTarget
}) {
  const lineRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLSpanElement>(null)
  const [picker, setPicker] = useState<Anchor | null>(null)
  const [box, setBox] = useState<PanelBox | null>(null)
  const [creating, setCreating] = useState(false)
  const [hint, setHint] = useState<{
    label: string
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    if (!picker) {
      return
    }

    function handlePointer(event: globalThis.MouseEvent) {
      if ((event.target as HTMLElement).closest('[data-tag-picker]')) {
        return
      }
      setPicker(null)
      setCreating(false)
    }

    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [picker])

  useLayoutEffect(() => {
    if (!picker || !panelRef.current) {
      setBox(null)
      return
    }

    const node = panelRef.current
    setBox(placePanel(picker, node.offsetWidth, node.offsetHeight))
  }, [picker, creating])

  function closePicker() {
    setPicker(null)
    setCreating(false)
    window.getSelection()?.removeAllRanges()
  }

  function applyTag(tagId: number) {
    if (!picker || !onApply) {
      return
    }

    onApply(picker.start, picker.end, picker.excerpt, tagId)
    closePicker()
  }

  function handleMouseUp(event: MouseEvent<HTMLSpanElement>) {
    if (!editing || !onApply || !lineRef.current) {
      return
    }

    if ((event.target as HTMLElement).closest('[data-tag-picker]')) {
      return
    }

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setPicker(null)
      setCreating(false)
      return
    }

    const range = selection.getRangeAt(0)
    if (!lineRef.current.contains(range.commonAncestorContainer)) {
      return
    }

    const prefix = range.cloneRange()
    prefix.selectNodeContents(lineRef.current)
    prefix.setEnd(range.startContainer, range.startOffset)
    const start = prefix.toString().length
    const excerpt = range.toString()
    const end = start + excerpt.length

    if (!excerpt.trim() || end <= start) {
      setPicker(null)
      setCreating(false)
      return
    }

    const rect = range.getBoundingClientRect()
    setCreating(false)
    setHint(null)
    setPicker({
      start,
      end,
      excerpt: excerpt.trim(),
      x: rect.left + rect.width / 2,
      top: rect.top,
      bottom: rect.bottom,
    })
  }

  const segments = lyricSegments(text, marks)
  const available = tags ?? []

  return (
    <span className="relative">
      <span
        ref={lineRef}
        onMouseUp={handleMouseUp}
        className={cx(editing && 'cursor-text select-text')}
      >
        {segments.map((segment, index) => {
          if (segment.marks.length === 0) {
            return <span key={`${segment.text}-${index}`}>{segment.text}</span>
          }

          const label = [...new Set(segment.marks.map((mark) => mark.tag.name))].join(' · ')

          return (
            <span
              key={`${segment.text}-${index}`}
              className="lyric-tag-hit"
              onMouseEnter={(event) => {
                if (picker) {
                  return
                }
                const rect = event.currentTarget.getBoundingClientRect()
                setHint({
                  label,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                })
              }}
              onMouseLeave={() => setHint(null)}
            >
              {segment.marks.reduce<ReactNode>(
                (child, mark) => (
                  <span
                    key={`${mark.id}-${index}`}
                    data-tag-color={mark.tag.color}
                    className={cx('lyric-tag', `is-${mark.tag.shape}`, editing && 'cursor-pointer')}
                    style={{ '--tag': TAG_COLOR_CSS[mark.tag.color] } as CSSProperties}
                    onClick={
                      editing && onRemove
                        ? (event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            setHint(null)
                            onRemove(mark.id)
                          }
                        : undefined
                    }
                  >
                    {child}
                  </span>
                ),
                segment.text,
              )}
            </span>
          )
        })}
      </span>

      <AnimatePresence>
        {hint && !picker ? (
          <motion.span
            key="tag-hint"
            className="panel panel-float pointer-events-none fixed z-50 max-w-[16rem] rounded-full px-3 py-1.5 text-sm font-semibold text-stage-fg"
            style={{ left: hint.x, top: hint.y }}
            initial={{ opacity: 0, scale: 0.94, x: '-50%', y: 'calc(-100% + 8px)' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: 'calc(-100% - 8px)' }}
            exit={{ opacity: 0, scale: 0.96, x: '-50%', y: 'calc(-100% + 4px)' }}
            transition={{ duration: 0.18, ease: pageEase }}
          >
            {hint.label}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {picker ? (
          <motion.span
            key="tag-picker"
            ref={panelRef}
            data-tag-picker
            className={cx(
              'panel panel-float app-scroll fixed z-50 rounded-[1.4rem] p-2',
              creating
                ? 'max-h-[min(32rem,calc(100svh-6rem))] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto px-5 py-4'
                : 'flex max-w-[18rem] flex-wrap items-center gap-1.5',
              (box?.placement ?? 'above') === 'above' ? 'origin-bottom' : 'origin-top',
            )}
            style={{
              left: box?.left ?? picker.x,
              top: box?.top ?? picker.top,
              visibility: box ? 'visible' : 'hidden',
            }}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.22, ease: pageEase }}
            onMouseDown={(event) => {
              if ((event.target as HTMLElement).closest('input, textarea, button')) {
                return
              }
              event.preventDefault()
            }}
          >
            {creating ? (
              <TagForm
                compact
                target={target ?? { id: '', name: 'Canción', scope: 'track' }}
                onSaved={(tag) => {
                  onTagCreated?.(tag)
                  applyTag(tag.id)
                }}
                onCancel={() => setCreating(false)}
              />
            ) : (
              <>
                {available.map((tag, index) => (
                  <motion.span
                    key={tag.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.04 + index * 0.03, ease: pageEase }}
                  >
                    <TagChip tag={tag} onClick={() => applyTag(tag.id)} />
                  </motion.span>
                ))}
                <Button
                  variant="icon"
                  aria-label="Nueva etiqueta"
                  className="h-8 w-8"
                  onClick={() => setCreating(true)}
                >
                  <Plus size={16} />
                </Button>
              </>
            )}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}
