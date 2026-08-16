import { AnimatePresence, motion } from 'framer-motion'
import { Volume1, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useMatch } from 'react-router-dom'
import { usePlayerVolume } from '../modules/player/hooks/useSpotifyPlayer'
import { Button } from '../shared/components/Button'

function VolumeIcon({ volume }: { volume: number }) {
  if (volume <= 0) {
    return <VolumeX size={18} />
  }

  if (volume < 0.45) {
    return <Volume1 size={18} />
  }

  return <Volume2 size={18} />
}

export function VolumeControls() {
  const onTrack = Boolean(useMatch('/cancion/:id'))
  const { volume, setVolume } = usePlayerVolume()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastAudible = useRef(volume > 0 ? volume : 0.8)
  const percent = Math.round(volume * 100)

  useEffect(() => {
    if (!onTrack) {
      setOpen(false)
    }
  }, [onTrack])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleVolume(next: number) {
    if (next > 0) {
      lastAudible.current = next
    }

    setVolume(next)
  }

  function handleMute() {
    if (volume > 0) {
      lastAudible.current = volume
      setVolume(0)
      return
    }

    setVolume(lastAudible.current || 0.8)
  }

  return (
    <AnimatePresence>
      {onTrack ? (
        <motion.div
          key="volume"
          ref={panelRef}
          className="relative"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.86 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            variant="icon"
            onClick={() => setOpen((current) => !current)}
            aria-label="Volumen"
            aria-expanded={open}
            title="Volumen"
          >
            <VolumeIcon volume={volume} />
          </Button>

          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="panel absolute top-[calc(100%+10px)] right-0 flex w-max items-center gap-2 rounded-full px-3 py-2"
              >
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center text-stage-fg"
                  aria-label={volume > 0 ? 'Silenciar' : 'Activar sonido'}
                  onClick={handleMute}
                >
                  <VolumeIcon volume={volume} />
                </button>
                <input
                  className="player-range volume-range"
                  type="range"
                  min={0}
                  max={100}
                  value={percent}
                  aria-label="Nivel de volumen"
                  aria-valuetext={`${percent}%`}
                  style={
                    {
                      '--player-progress': `linear-gradient(to right, var(--app-accent) ${percent}%, color-mix(in srgb, var(--app-stage-fg) 16%, transparent) ${percent}%)`,
                    } as CSSProperties
                  }
                  onChange={(event) => handleVolume(Number(event.target.value) / 100)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
