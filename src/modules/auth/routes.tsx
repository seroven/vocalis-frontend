import type { RouteObject } from 'react-router-dom'
import { CallbackPage } from './CallbackPage'
import { LoginPage } from './LoginPage'

export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'auth/callback',
    element: <CallbackPage />,
  },
]
