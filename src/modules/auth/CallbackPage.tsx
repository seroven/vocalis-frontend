import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { VocalisLogo } from '../../brand/VocalisLogo'
import { useAuth } from './AuthContext'
import type { PublicUser } from './interfaces/auth.interface'
import { AuthService } from './services/AuthService'

const HOLD_MS = 2500

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

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function CallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const spotifyError = searchParams.get('error')
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (spotifyError) {
      navigate('/login', { replace: true })
      return
    }

    if (!code || !state) {
      return
    }

    let cancelled = false

    Promise.all([completeLoginOnce(code, state), wait(HOLD_MS)])
      .then(([user]) => {
        if (cancelled) {
          return
        }

        setUser(user)
        navigate('/', { replace: true })
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        navigate('/login', { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [navigate, searchParams, setUser])

  return (
    <section className="mx-auto w-full max-w-2xl text-center">
      <h1 className="flex justify-center">
        <VocalisLogo animated variant="wordmark" className="h-14 w-auto md:h-16" />
      </h1>
    </section>
  )
}
