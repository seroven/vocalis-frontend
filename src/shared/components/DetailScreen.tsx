import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { BrandLoader } from '../../brand/BrandLoader'
import { cx } from '../lib/cx'
import { BackButton } from './BackButton'

const ease = [0.22, 1, 0.36, 1] as const

const list = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
}

export function RevealBlock({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <motion.div variants={item} className={className}>{children}</motion.div>
}

export function DetailScreen({
  ready,
  error,
  errorMessage,
  className,
  centered = false,
  children,
}: {
  ready: boolean
  error: boolean
  errorMessage: string
  className?: string
  centered?: boolean
  children: ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <section className={cx('mx-auto flex min-h-full w-full flex-1 flex-col', className)}>
      <div className={centered ? 'text-left' : undefined}>
        <BackButton />
      </div>

      {error ? (
        <p className="text-center text-stage-muted">{errorMessage}</p>
      ) : (
        <AnimatePresence mode="wait">
          {!ready ? (
            <BrandLoader key="loader" />
          ) : (
            <motion.div
              key="content"
              className={centered ? 'text-center' : undefined}
              variants={reduceMotion ? undefined : list}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  )
}
