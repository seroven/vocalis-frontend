import { LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { VocalisLogo } from '../brand/VocalisLogo'
import { useAuth } from '../modules/auth/AuthContext'
import { AuthService } from '../modules/auth/services/AuthService'
import { ThemeControls } from './ThemeControls'

export function AppHeader() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  async function handleLogout() {
    await AuthService.logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <header className="z-20 mx-auto flex w-[min(1120px,calc(100%-1rem))] items-center justify-between py-4">
      <Link to="/" className="logo-link text-accent" aria-label="Vocalis">
        <VocalisLogo animated className="h-8 w-auto" />
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
