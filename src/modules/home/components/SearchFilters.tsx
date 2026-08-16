import { AnimatePresence, motion } from 'framer-motion'
import { Disc3, LayoutGrid, Mic2, Music2, Search, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { SearchFilter } from '../interfaces/search.interface'

const ease = [0.22, 1, 0.36, 1] as const

const FILTERS: Array<{ id: SearchFilter; label: string; Icon: LucideIcon }> = [
  { id: 'all', label: 'Todo', Icon: LayoutGrid },
  { id: 'track', label: 'Canción', Icon: Music2 },
  { id: 'album', label: 'Álbum', Icon: Disc3 },
  { id: 'artist', label: 'Artista', Icon: Mic2 },
]

type SearchFiltersProps = {
  value: SearchFilter
  onChange: (filter: SearchFilter) => void
}

export function SearchFilters({ value, onChange }: SearchFiltersProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const filtered = value !== 'all'

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`icon-btn grid h-10 w-10 place-items-center rounded-full ${
          filtered || open ? 'text-accent' : ''
        }`}
        aria-label="Filtros de búsqueda"
        aria-expanded={open}
      >
        <Search size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease }}
            className="panel absolute top-[calc(100%+10px)] right-0 z-30 w-44 rounded-2xl p-1.5"
            role="radiogroup"
            aria-label="Filtrar resultados"
          >
            {FILTERS.map((filter) => {
              const selected = value === filter.id

              return (
                <button
                  key={filter.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    onChange(filter.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? 'bg-accent-soft font-semibold text-accent'
                      : 'text-stage-muted hover:text-stage-fg'
                  }`}
                >
                  <filter.Icon size={15} strokeWidth={selected ? 2.3 : 1.8} />
                  {filter.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
