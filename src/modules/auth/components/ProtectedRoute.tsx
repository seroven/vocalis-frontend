import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export function ProtectedRoute() {
  const { user, ready } = useAuth()

  if (!ready) {
    return <p className="m-auto text-stage-muted">Cargando sesión...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <Outlet />
    </div>
  )
}
