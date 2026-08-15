import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export function ProtectedRoute() {
  const { user, ready } = useAuth()

  if (!ready) {
    return <p className="w-full text-center text-stage-muted">Cargando sesión...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
