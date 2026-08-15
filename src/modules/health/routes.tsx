import type { RouteObject } from 'react-router-dom'
import { HealthPage } from './HealthPage'

export const healthRoutes: RouteObject[] = [
  {
    path: '',
    element: <HealthPage />,
  },
]
