import type { RouteObject } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { healthRoutes } from '../modules/health/routes'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [...healthRoutes],
  },
]
