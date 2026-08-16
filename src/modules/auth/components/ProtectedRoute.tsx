import { Navigate, Outlet } from 'react-router-dom'
import { BrandLoader } from '../../../brand/BrandLoader'
import { useAuth } from '../AuthContext'

export function ProtectedRoute() {
  const { user, ready } = useAuth()

  if (!ready) {
    return <BrandLoader />
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
