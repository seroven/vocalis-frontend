import type { RouteObject } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { ProtectedRoute } from '../modules/auth/components/ProtectedRoute'
import { authRoutes } from '../modules/auth/routes'
import { homeRoutes } from '../modules/home/routes'
import { recordingsRoutes } from '../modules/recordings/routes'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      ...authRoutes,
      {
        element: <ProtectedRoute />,
        children: [...homeRoutes, ...recordingsRoutes],
      },
    ],
  },
]
