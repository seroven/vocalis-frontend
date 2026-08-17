import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { VocalisLogo } from '../../brand/VocalisLogo'
import { Button } from '../../shared/components/Button'
import { useAuth } from './AuthContext'
import { SpotifyIcon } from './components/SpotifyIcon'
import { AuthService } from './services/AuthService'

export function LoginPage() {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleLogin() {
    setError(null)
    setLoading(true)

    try {
      const response = await AuthService.getSpotifyLogin()
      window.location.href = response.data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el login')
      setLoading(false)
    }
  }

  return (
    <section className="m-auto w-full text-center">
      <h1 className="flex justify-center">
        <VocalisLogo animated variant="wordmark" className="h-14 w-auto text-accent md:h-16" />
      </h1>
      <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-stage-muted">
        Entra con Spotify Premium y convierte cada práctica en algo que apetece repetir.
      </p>
      <Button
        className="mt-10 gap-3 py-2.5 pr-6 pl-2.5"
        onClick={() => void handleLogin()}
        disabled={loading}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-current/15">
          <SpotifyIcon size={20} />
        </span>
        {loading ? 'Redirigiendo...' : 'Continuar con Spotify'}
      </Button>
      {error && <p className="mt-4 text-rose-400">{error}</p>}
    </section>
  )
}
