import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext'
import { AuthService } from '../modules/auth/services/AuthService'
import { ThemeControls } from './ThemeControls'

export function AppHeader() {
  const { user, setUser } = useAuth()

  async function handleLogout() {
    await AuthService.logout()
    setUser(null)
  }

  return (
    <header className="z-20 mx-auto flex w-[min(1120px,calc(100%-1rem))] items-center justify-between py-4">
      <Link to="/" className="logo-link flex items-center gap-2.5">
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-accent-soft">
          <span className="animate-pulse-soft h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <span className="font-display text-lg tracking-tight">Vocalis</span>
      </Link>

      <div className="flex items-center gap-1.5">
        <ThemeControls />
        {user && (
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="icon-btn grid h-10 w-10 place-items-center rounded-full"
            aria-label="Salir"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
