import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { pageMotion } from '../shared/lib/page-motion'

export function StageOutlet() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...pageMotion}
        className="flex min-h-full w-full flex-1 flex-col"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
