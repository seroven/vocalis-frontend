import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <strong>Vocalis</strong>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
