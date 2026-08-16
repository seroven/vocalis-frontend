import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cx } from '../shared/lib/cx'
import { VocalisLogo } from './VocalisLogo'

export const LOADER_HOLD_MS = 2400
const ease = [0.22, 1, 0.36, 1] as const

type BrandLoaderProps = {
  className?: string
  logoClassName?: string
  label?: string
}

export function useLoaderGate(done: boolean, resetKey?: string) {
  const reduceMotion = useReducedMotion()
  const hold = reduceMotion ? 0 : LOADER_HOLD_MS
  const [elapsed, setElapsed] = useState(hold === 0)

  useEffect(() => {
    setElapsed(hold === 0)

    if (hold === 0) {
      return
    }

    const timer = window.setTimeout(() => setElapsed(true), hold)
    return () => window.clearTimeout(timer)
  }, [hold, resetKey])

  return done && elapsed
}

export function BrandLoader({
  className,
  logoClassName = 'h-12 w-auto md:h-14',
  label = 'Cargando',
}: BrandLoaderProps) {
  return (
    <motion.div
      className={cx('grid min-h-[40vh] flex-1 place-items-center', className)}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.42, ease }}
      role="status"
      aria-label={label}
    >
      <VocalisLogo
        animated
        interactive={false}
        variant="wordmark"
        className={logoClassName}
      />
    </motion.div>
  )
}
