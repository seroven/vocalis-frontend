import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLoaderGate } from '../../brand/BrandLoader'
import { DetailScreen, RevealBlock } from '../../shared/components/DetailScreen'
import { TrackList } from '../home/components/TrackList'
import type { AlbumDetail } from '../home/interfaces/search.interface'
import { SpotifyService } from '../home/services/SpotifyService'
import { TagsMenu } from '../tags/components/TagsPanel'
import { useTags } from '../tags/hooks/useTags'

export function AlbumPage() {
  const { id } = useParams()
  const [album, setAlbum] = useState<AlbumDetail | null>(null)
  const [error, setError] = useState(false)
  const ready = useLoaderGate(Boolean(album), id)
  const { tags, setTags } = useTags('album', id)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    setAlbum(null)
    setError(false)

    void SpotifyService.album(id)
      .then((response) => {
        if (!cancelled) {
          setAlbum(response.data)
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

  return (
    <DetailScreen
      ready={ready && Boolean(album)}
      error={error}
      errorMessage="No se pudo abrir este álbum."
      className="w-full"
      actions={
        <TagsMenu
          tags={tags}
          target={
            album
              ? { id: album.id, name: album.title, scope: 'album' }
              : { id: id ?? '', name: 'Álbum', scope: 'album' }
          }
          onCreated={(tag) => setTags((current) => [tag, ...current])}
        />
      }
    >
      {album ? (
        <>
          <RevealBlock>
            <p className="text-center text-sm tracking-[0.18em] text-accent uppercase">Álbum</p>
            <h1 className="mt-3 text-center font-display text-4xl tracking-tight text-stage-fg md:text-5xl">
              ¿Qué cantamos hoy?
            </h1>
            <p className="mt-3 text-center text-stage-muted">
              {album.title}
              {album.subtitle ? ` · ${album.subtitle}` : ''}
            </p>
          </RevealBlock>

          <RevealBlock className="mt-10">
            <TrackList items={album.tracks} />
          </RevealBlock>
        </>
      ) : null}
    </DetailScreen>
  )
}
