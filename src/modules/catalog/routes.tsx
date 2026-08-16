import type { RouteObject } from 'react-router-dom'
import { AlbumPage } from '../album/AlbumPage'
import { ArtistPage } from '../artist/ArtistPage'
import { TrackPage } from '../track/TrackPage'

export const catalogRoutes: RouteObject[] = [
  {
    path: 'album/:id',
    element: <AlbumPage />,
  },
  {
    path: 'artista/:id',
    element: <ArtistPage />,
  },
  {
    path: 'cancion/:id',
    element: <TrackPage />,
  },
]
