import { AnimatePresence, motion } from 'framer-motion'
import { Check, Mic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMicDevice } from '../modules/recordings/MicDeviceContext'
import { Button } from '../shared/components/Button'
import { pageEase } from '../shared/lib/page-motion'

export function MicControls() {
  const { deviceId, devices, setDeviceId, refresh } = useMicDevice()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  async function handleToggle() {
    const next = !open
    setOpen(next)
    if (!next) {
      return
    }

    setError(null)
    try {
      const listed = await navigator.mediaDevices.enumerateDevices()
      const known = listed.some((device) => device.kind === 'audioinput' && device.label)
      if (!known) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      }
      await refresh()
    } catch {
      setError('No se pudo acceder al micrófono. Revisa los permisos del navegador.')
    }
  }

  return (
    <div className="relative z-80" ref={panelRef}>
      <Button
        variant="icon"
        onClick={() => void handleToggle()}
        aria-label="Elegir micrófono"
        aria-expanded={open}
        className={open || deviceId ? 'text-accent' : undefined}
      >
        <Mic size={18} />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: pageEase }}
            className="panel panel-float app-scroll absolute top-[calc(100%+10px)] right-0 z-80 max-h-[min(22rem,calc(100svh-8rem))] w-[min(20rem,calc(100vw-2.5rem))] overflow-y-auto rounded-[1.4rem] px-3 py-3"
          >
            <p className="px-2 pb-2 text-xs tracking-[0.16em] text-accent uppercase">
              Micrófono
            </p>
            {error ? <p className="px-2 pb-2 text-sm text-rose-400">{error}</p> : null}
            <button
              type="button"
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm ${
                !deviceId ? 'bg-accent-soft font-semibold text-accent' : 'text-stage-muted hover:text-stage-fg'
              }`}
              onClick={() => setDeviceId(null)}
            >
              <Check size={16} className={!deviceId ? 'opacity-100' : 'opacity-0'} />
              Predeterminado
            </button>
            {devices.map((device, index) => {
              const selected = deviceId === device.deviceId
              return (
                <button
                  key={device.deviceId || `mic-${index}`}
                  type="button"
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm ${
                    selected
                      ? 'bg-accent-soft font-semibold text-accent'
                      : 'text-stage-muted hover:text-stage-fg'
                  }`}
                  onClick={() => setDeviceId(device.deviceId)}
                >
                  <Check size={16} className={selected ? 'opacity-100' : 'opacity-0'} />
                  <span className="truncate">
                    {device.label || `Micrófono ${index + 1}`}
                  </span>
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
