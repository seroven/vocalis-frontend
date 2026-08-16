export const pageEase = [0.22, 1, 0.36, 1] as const

export const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.42, ease: pageEase },
}
