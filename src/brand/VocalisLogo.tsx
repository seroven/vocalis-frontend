import { motion, useReducedMotion } from 'framer-motion'
import {
  MARK_PATH,
  WORDMARK_DRAW_PATH,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from './logoPaths'

type VocalisLogoProps = {
  className?: string
  animated?: boolean
  interactive?: boolean
  variant?: 'mark' | 'wordmark'
}

const ease = [0.22, 1, 0.36, 1] as const
const WORDMARK_LETTERS = WORDMARK_DRAW_PATH.split(/(?<=Z)\s+(?=M)/)
const LETTER_DURATION = 0.52
const LETTER_STAGGER = 0.2

export function VocalisLogo({
  className,
  animated = false,
  interactive = true,
  variant = 'mark',
}: VocalisLogoProps) {
  const reduceMotion = useReducedMotion()
  const shouldAnimate = animated && !reduceMotion
  const wordmark = variant === 'wordmark'
  const fillDelay = wordmark
    ? (WORDMARK_LETTERS.length - 1) * LETTER_STAGGER + LETTER_DURATION * 0.55
    : 1.2
  const canPress = interactive && !reduceMotion

  return (
    <motion.svg
      viewBox={wordmark ? WORDMARK_VIEWBOX : '328 341 679 483'}
      className={`vocalis-logo ${interactive ? '' : 'pointer-events-none'} ${className ?? ''}`}
      role="img"
      aria-label="Vocalis"
      fill="none"
      inherit={false}
      whileHover={canPress ? { scale: 1.07, rotate: -2 } : undefined}
      whileTap={canPress ? { scale: 0.97, rotate: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 340, damping: 18 }}
    >
      {shouldAnimate && wordmark &&
        WORDMARK_LETTERS.map((letter, index) => (
          <motion.path
            key={index}
            d={letter}
            fill="none"
            stroke="var(--app-accent)"
            strokeWidth={26}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: LETTER_DURATION,
              delay: index * LETTER_STAGGER,
              ease,
            }}
          />
        ))}

      {shouldAnimate && !wordmark && (
        <motion.path
          d={MARK_PATH}
          fill="none"
          stroke="var(--app-accent)"
          strokeWidth={16}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease }}
        />
      )}

      <motion.path
        d={wordmark ? WORDMARK_PATH : MARK_PATH}
        fill="var(--app-accent)"
        fillRule={wordmark ? 'evenodd' : 'nonzero'}
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: shouldAnimate ? fillDelay : 0, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}
