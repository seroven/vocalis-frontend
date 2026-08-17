import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { cx } from '../../../shared/lib/cx'
import { pageEase } from '../../../shared/lib/page-motion'
import { TAG_COLOR_CSS, type Tag, type TagColor, type TagShape } from '../interfaces/tag.interface'

export function TagChip({
  tag,
  selected = false,
  onClick,
  className,
}: {
  tag: Pick<Tag, 'name' | 'color' | 'shape'>
  selected?: boolean
  onClick?: () => void
  className?: string
}) {
  const content = (
    <span
      data-tag-color={tag.color}
      className={cx('lyric-tag tag-chip', `is-${tag.shape}`, className)}
      style={{ '--tag': TAG_COLOR_CSS[tag.color] } as CSSProperties}
    >
      <span className="truncate">{tag.name}</span>
    </span>
  )

  if (!onClick) {
    return content
  }

  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault()
        onClick()
      }}
      className={cx(
        'rounded-full px-1 py-0.5 text-left transition-transform hover:scale-105',
        selected && 'ring-2 ring-accent/50',
      )}
    >
      {content}
    </button>
  )
}

export function TagSwatch({
  color,
  shape,
  selected = false,
  label,
  onClick,
}: {
  color: TagColor
  shape?: TagShape
  selected?: boolean
  label?: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      data-tag-color={color}
      className="grid h-8 min-w-8 place-items-center rounded-full px-2 text-[0.65rem] font-semibold"
      animate={{
        scale: selected ? 1.12 : 1,
        opacity: selected ? 1 : 0.68,
      }}
      transition={{ duration: 0.28, ease: pageEase }}
      style={{
        '--tag': TAG_COLOR_CSS[color],
        background: 'color-mix(in srgb, var(--tag) 28%, transparent)',
        color: 'var(--tag)',
        boxShadow: selected ? '0 0 0 2px var(--tag)' : '0 0 0 0px transparent',
        transition:
          'background 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1), color 280ms cubic-bezier(0.22, 1, 0.36, 1)',
      } as CSSProperties}
    >
      {shape ? (
        <span data-tag-color={color} className={cx('lyric-tag', `is-${shape}`)}>
          Aa
        </span>
      ) : (
        <span className="h-3.5 w-3.5 rounded-full" style={{ background: 'var(--tag)' }} />
      )}
    </motion.button>
  )
}
