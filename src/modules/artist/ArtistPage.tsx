import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLoaderGate } from '../../brand/BrandLoader'
import { DetailScreen, RevealBlock } from '../../shared/components/DetailScreen'
import { CatalogGrid } from '../home/components/CatalogGrid'
import { TrackList } from '../home/components/TrackList'
import type { ArtistDetail } from '../home/interfaces/search.interface'
import { SpotifyService } from '../home/services/SpotifyService'

export function ArtistPage() {
  const { id } = useParams()
  const [artist, setArtist] = useState<ArtistDetail | null>(null)
  const [error, setError] = useState(false)
  const ready = useLoaderGate(Boolean(artist), id)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    setArtist(null)
    setError(false)

    void SpotifyService.artist(id)
      .then((response) => {
        if (!cancelled) {
          setArtist(response.data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const initial = artist?.title.trim().charAt(0).toUpperCase() || '?'

  return (
    <DetailScreen
      ready={ready && Boolean(artist)}
      error={error}
      errorMessage="No se pudo abrir este artista."
      className="max-w-[53rem]"
    >
      {artist ? (
        <>
          <RevealBlock>
            <header className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
              <div className="catalog-cover is-artist h-36 w-36 shrink-0 md:h-44 md:w-44">
                {artist.imageUrl ? (
                  <img src={artist.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center font-display text-4xl text-accent">
                    {initial}
                  </div>
                )}
              </div>
              <h1 className="text-center font-display text-4xl tracking-tight text-stage-fg md:text-left md:text-6xl">
                {artist.title}
              </h1>
            </header>
          </RevealBlock>

          <RevealBlock>
            <h2 className="mt-12 mb-4 font-display text-2xl tracking-tight">Canciones</h2>
            <TrackList items={artist.tracks} />
          </RevealBlock>

          {artist.albums.length > 0 ? (
            <RevealBlock>
              <h2 className="mt-12 font-display text-2xl tracking-tight">Álbumes</h2>
              <CatalogGrid
                items={artist.albums}
                className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5"
              />
            </RevealBlock>
          ) : null}
        </>
      ) : null}
    </DetailScreen>
  )
}
