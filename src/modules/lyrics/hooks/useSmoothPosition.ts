import { useEffect, useRef, useState } from 'react'

export function useSmoothPosition(
  position: number,
  playing: boolean,
  duration: number,
) {
  const [smooth, setSmooth] = useState(position)
  const originRef = useRef({ position, at: performance.now() })

  useEffect(() => {
    const predicted =
      originRef.current.position + (performance.now() - originRef.current.at)
    const drifted = Math.abs(predicted - position) > 220

    if (!playing || drifted) {
      originRef.current = { position, at: performance.now() }
      setSmooth(position)
    }
  }, [playing, position])

  useEffect(() => {
    if (!playing) {
      return
    }

    let frame = 0

    function tick() {
      const elapsed = performance.now() - originRef.current.at
      setSmooth(Math.min(duration || Infinity, originRef.current.position + elapsed))
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [duration, playing, position])

  return playing ? smooth : position
}
