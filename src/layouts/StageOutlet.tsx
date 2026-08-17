import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { pageMotion } from '../shared/lib/page-motion'

export function StageOutlet() {
  const location = useLocation()
  const outlet = useOutlet()
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    setSettled(false)
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...pageMotion}
        onAnimationComplete={() => setSettled(true)}
        className={`flex min-h-full w-full flex-1 flex-col${settled ? ' motion-settled' : ''}`}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
