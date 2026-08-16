import type { RouteObject } from 'react-router-dom'
import { RecordingsPage } from './RecordingsPage'

export const recordingsRoutes: RouteObject[] = [
  {
    path: 'grabaciones',
    element: <RecordingsPage />,
  },
]
