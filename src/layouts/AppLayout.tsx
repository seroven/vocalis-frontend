import { AmbientBackground } from '../theme/AmbientBackground'
import { AppHeader } from './AppHeader'
import { StageOutlet } from './StageOutlet'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col px-4 pb-4">
      <AppHeader />
      <section className="app-stage relative flex min-h-0 flex-1 overflow-hidden rounded-[2.5rem] text-stage-fg">
        <AmbientBackground />
        <main className="relative z-10 mx-auto flex w-[min(1120px,calc(100%-2.5rem))] min-h-0 flex-1 flex-col overflow-y-auto py-12 md:py-16">
          <StageOutlet />
        </main>
      </section>
    </div>
  )
}
