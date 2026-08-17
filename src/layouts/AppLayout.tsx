import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AmbientBackground } from '../theme/AmbientBackground'
import { AppHeader } from './AppHeader'
import { StageOutlet } from './StageOutlet'

export function AppLayout() {
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) {
      return
    }

    const syncHeight = () => {
      node.style.setProperty('--app-scroll-h', `${node.clientHeight}px`)
    }

    syncHeight()
    const observer = new ResizeObserver(syncHeight)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-svh flex-col px-4 pb-4">
      <AppHeader />
      <section id="app-stage" className="app-stage relative flex min-h-0 flex-1 overflow-hidden rounded-[2.5rem] text-stage-fg">
        <div ref={scrollRef} className="app-scroll relative min-h-0 flex-1">
          <div className="ambient-layer">
            <AmbientBackground />
          </div>
          <main className="app-width relative flex min-h-full flex-col py-12 md:py-16">
            <StageOutlet />
          </main>
        </div>
      </section>
    </div>
  )
}
