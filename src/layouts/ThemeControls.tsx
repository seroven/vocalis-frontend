import { AnimatePresence, motion } from 'framer-motion'
import { Disc3, Moon, Palette, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../shared/components/Button'
import { COLOR_PRESETS } from '../theme/theme'
import { useTheme } from '../theme/ThemeContext'

export function ThemeControls() {
  const { mode, hue, setHue, toggleMode } = useTheme()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative z-80" ref={panelRef}>
        <Button
          variant="icon"
          onClick={() => setOpen((current) => !current)}
          aria-label="Elegir color"
          aria-expanded={open}
        >
          <Palette size={18} />
        </Button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="panel absolute top-[calc(100%+10px)] right-0 z-80 flex items-center gap-1 rounded-full px-2 py-1.5"
              role="radiogroup"
              aria-label="Color base"
            >
              {COLOR_PRESETS.map((preset) => {
                const selected = hue === preset.hue

                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={preset.label}
                    title={preset.label}
                    onClick={() => setHue(preset.hue)}
                    className={`disc-swatch grid h-8 w-8 place-items-center rounded-full ${
                      selected ? 'scale-110 drop-shadow-md opacity-100' : 'opacity-65'
                    }`}
                    style={{ color: `hsl(${preset.hue} 72% 56%)` }}
                  >
                    <Disc3 size={20} strokeWidth={selected ? 2.2 : 1.6} />
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="icon"
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={mode}
            initial={{ opacity: 0, rotate: -40, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 40, scale: 0.8 }}
            transition={{ duration: 0.22 }}
            className="grid place-items-center"
          >
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.span>
        </AnimatePresence>
      </Button>
    </div>
  )
}
