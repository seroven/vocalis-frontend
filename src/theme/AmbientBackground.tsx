import { motion } from 'framer-motion'
import {
  AudioLines,
  AudioWaveform,
  Disc3,
  Headphones,
  Mic2,
  Music,
  Music2,
  Piano,
} from 'lucide-react'
import { useMemo } from 'react'

const ICONS = [Music, Music2, Mic2, AudioLines, Disc3, Headphones, AudioWaveform, Piano]

export function AmbientBackground() {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const particles = useMemo(
    () =>
      ICONS.map((Icon, index) => ({
        Icon,
        left: `${6 + ((index * 13) % 82)}%`,
        top: `${8 + ((index * 19) % 74)}%`,
        size: 88 + (index % 5) * 28,
        rotate: -28 + index * 11,
        duration: 14 + index * 1.8,
        delay: index * 0.28,
        opacity: 0.14 + (index % 3) * 0.05,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute text-accent"
          style={{
            left: particle.left,
            top: particle.top,
            opacity: particle.opacity,
          }}
          animate={
            reducedMotion
              ? { rotate: particle.rotate }
              : {
                  x: [0, 22, -16, 0],
                  y: [0, -28, 14, 0],
                  rotate: [
                    particle.rotate,
                    particle.rotate + 16,
                    particle.rotate - 12,
                    particle.rotate,
                  ],
                }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <particle.Icon size={particle.size} strokeWidth={1.15} />
        </motion.div>
      ))}
    </div>
  )
}
