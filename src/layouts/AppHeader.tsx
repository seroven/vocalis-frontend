import { LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { VocalisLogo } from '../brand/VocalisLogo'
import { useAuth } from '../modules/auth/AuthContext'
import { AuthService } from '../modules/auth/services/AuthService'
import { Button } from '../shared/components/Button'
import { MicControls } from './MicControls'
import { ThemeControls } from './ThemeControls'
import { VolumeControls } from './VolumeControls'

export function AppHeader() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  async function handleLogout() {
    await AuthService.logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-width relative z-50 flex items-center justify-between py-4">
      <Link to="/" className="logo-link text-accent" aria-label="Vocalis">
        <VocalisLogo animated className="h-8 w-auto" />
      </Link>

      <div className="flex items-center gap-1.5">
        {user ? <MicControls /> : null}
        <VolumeControls />
        <ThemeControls />
        {user && (
          <Button
            variant="icon"
            onClick={() => void handleLogout()}
            aria-label="Salir"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </header>
  )
}
