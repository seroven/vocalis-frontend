import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../config/api'
import { useAuth } from './AuthContext'
import type { PublicUser } from './interfaces/auth.interface'
import { AuthService } from './services/AuthService'

let inflightKey: string | null = null
let inflightLogin: Promise<PublicUser> | null = null

function completeLoginOnce(code: string, state: string) {
  const key = `${code}:${state}`

  if (inflightLogin && inflightKey === key) {
    return inflightLogin
  }

  inflightKey = key
  inflightLogin = AuthService.completeSpotifyLogin(code, state).then(
    (response) => response.data,
  )

  return inflightLogin
}

export function CallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const spotifyError = searchParams.get('error')
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (spotifyError) {
      setError('El acceso a Spotify fue cancelado o rechazado')
      return
    }

    if (!code || !state) {
      setError('Spotify no devolvió un código de autorización válido')
      return
    }

    let cancelled = false

    completeLoginOnce(code, state)
      .then((user) => {
        if (cancelled) {
          return
        }

        setUser(user)
        navigate('/', { replace: true })
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return
        }

        if (err instanceof ApiError) {
          setError(err.message)
          return
        }

        setError('No se pudo completar el login con Spotify')
      })

    return () => {
      cancelled = true
    }
  }, [navigate, searchParams, setUser])

  return (
    <section className="w-full text-center">
      <h1 className="font-display text-6xl tracking-tight text-stage-fg md:text-7xl">Vocalis</h1>
      {error ? (
        <p className="mt-4 text-rose-400">{error}</p>
      ) : (
        <p className="mt-4 text-lg text-stage-muted">Conectando...</p>
      )}
    </section>
  )
}
