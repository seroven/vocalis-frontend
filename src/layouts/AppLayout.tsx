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

  return (
    <div className="flex h-svh flex-col px-4 pb-4">
      <AppHeader />
      <section className="app-stage relative flex min-h-0 flex-1 overflow-hidden rounded-[2.5rem] text-stage-fg">
        <AmbientBackground />
        <div ref={scrollRef} className="app-scroll relative z-10 min-h-0 flex-1">
          <main className="relative mx-auto flex min-h-full w-[min(1120px,calc(100%-2.5rem))] flex-col py-12 md:py-16">
            <StageOutlet />
          </main>
        </div>
      </section>
    </div>
  )
}
