import type { RouteObject } from 'react-router-dom'
import { HomePage } from './HomePage'

export const homeRoutes: RouteObject[] = [
  {
    path: '',
    element: <HomePage />,
  },
]
