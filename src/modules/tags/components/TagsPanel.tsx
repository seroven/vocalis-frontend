import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Tags } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { pageEase } from '../../../shared/lib/page-motion'
import type { Tag, TagTarget } from '../interfaces/tag.interface'
import { TagChip } from './TagChip'
import { TagForm } from './TagForm'

export function TagsPanelButton({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <Button
      variant="icon"
      aria-label="Ver etiquetas"
      aria-expanded={open}
      onClick={onToggle}
      className={open ? 'text-accent' : undefined}
    >
      <Tags size={18} />
    </Button>
  )
}

export function TagsMenu({
  tags,
  target,
  onCreated,
}: {
  tags: Tag[]
  target: TagTarget
  onCreated: (tag: Tag) => void
}) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const visible = tags.filter(
    (tag) =>
      tag.scope === 'general' ||
      (tag.scope === target.scope && tag.targetId === target.id),
  )

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setCreating(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative z-80" ref={panelRef}>
      <TagsPanelButton
        open={open}
        onToggle={() => {
          setOpen((current) => !current)
          setCreating(false)
        }}
      />

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: pageEase }}
            className="panel panel-float app-scroll absolute top-[calc(100%+10px)] right-0 z-80 max-h-[min(36rem,calc(100svh-10rem))] w-[min(26rem,calc(100vw-2.5rem))] overflow-y-auto rounded-[1.6rem] px-6 py-5 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs tracking-[0.16em] text-accent uppercase">
                Etiquetas · {target.name}
              </p>
              <Button
                variant="icon"
                aria-label="Nueva etiqueta"
                aria-expanded={creating}
                className={`h-8 w-8 ${creating ? 'text-accent' : ''}`}
                onClick={() => setCreating((current) => !current)}
              >
                <Plus size={16} />
              </Button>
            </div>

            {visible.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {visible.map((tag) => (
                  <TagChip key={tag.id} tag={tag} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stage-muted">
                Aún no tienes etiquetas para {target.name}. Crea una aquí mismo.
              </p>
            )}

            <AnimatePresence initial={false}>
              {creating ? (
                <motion.div
                  key="tag-form"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: pageEase }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border-t border-line/60 pt-4">
                    <TagForm
                      compact
                      target={target}
                      onSaved={(tag) => {
                        onCreated(tag)
                        setCreating(false)
                      }}
                      onCancel={() => setCreating(false)}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
