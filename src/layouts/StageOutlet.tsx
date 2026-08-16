import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'

export function StageOutlet() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-full w-full flex-1 flex-col"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
