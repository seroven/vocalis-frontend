import { motion, useReducedMotion } from 'framer-motion'
import { Disc3, Mic2, Music2, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { itemPath } from '../itemPath'
import type { CatalogItem, CatalogItemType } from '../interfaces/search.interface'

const ease = [0.22, 1, 0.36, 1] as const

const TYPE_META: Record<
  CatalogItemType,
  { label: string; Icon: LucideIcon; cover: string }
> = {
  track: { label: 'Canción', Icon: Music2, cover: 'catalog-cover is-release' },
  album: { label: 'Álbum', Icon: Disc3, cover: 'catalog-cover is-release' },
  artist: { label: 'Artista', Icon: Mic2, cover: 'catalog-cover is-artist' },
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease },
  },
}

function CatalogCard({ item }: { item: CatalogItem }) {
  const reduceMotion = useReducedMotion()
  const meta = TYPE_META[item.type]
  const initial = item.title.trim().charAt(0).toUpperCase() || '?'
  const artist = item.type === 'artist'

  return (
    <motion.article
      variants={cardVariants}
      className={`min-w-0 ${artist ? 'text-center' : 'text-left'}`}
    >
      <Link to={itemPath(item)} className="block">
        <motion.div
          className={meta.cover}
          whileHover={reduceMotion ? undefined : { y: -4, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 340, damping: 20 }}
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center font-display text-2xl text-accent">
              {initial}
            </div>
          )}
        </motion.div>

        <div className={`catalog-tag ${artist ? 'mx-auto' : ''}`}>
          <meta.Icon size={11} strokeWidth={2.2} />
          {meta.label}
        </div>
        <h2 className="mt-1.5 truncate text-[0.86rem] leading-tight font-semibold tracking-tight text-stage-fg">
          {item.title}
        </h2>
        <p className="mt-0.5 truncate text-xs text-stage-muted">{item.subtitle}</p>
      </Link>
    </motion.article>
  )
}

export function CatalogGrid({
  items,
  className = 'mt-8 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5',
}: {
  items: CatalogItem[]
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={listVariants}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
    >
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} />
      ))}
    </motion.div>
  )
}

export function SearchPulse() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex items-center justify-center gap-1.5"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease }}
      aria-live="polite"
      aria-label="Buscando"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-accent"
          animate={
            reduceMotion
              ? { opacity: 0.7 }
              : { y: [0, -5, 0], opacity: [0.4, 1, 0.4] }
          }
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: index * 0.12,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}
