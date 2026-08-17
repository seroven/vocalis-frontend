import type { RouteObject } from 'react-router-dom'
import { TagsPage } from './TagsPage'

export const tagsRoutes: RouteObject[] = [
  {
    path: 'etiquetas',
    element: <TagsPage />,
  },
]
