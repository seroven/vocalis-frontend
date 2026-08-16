import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLoaderGate } from '../../brand/BrandLoader'
import { DetailScreen, RevealBlock } from '../../shared/components/DetailScreen'
import { TrackPlayer } from '../player/components/TrackPlayer'
import type { TrackPageData } from '../home/interfaces/search.interface'
import { SpotifyService } from '../home/services/SpotifyService'

export function TrackPage() {
  const { id } = useParams()
  const [data, setData] = useState<TrackPageData | null>(null)
  const [error, setError] = useState(false)
  const ready = useLoaderGate(Boolean(data), id)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    setData(null)
    setError(false)

    void SpotifyService.track(id)
      .then((response) => {
        if (!cancelled) {
          setData(response.data)
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
      ready={ready && Boolean(data)}
      error={error}
      errorMessage="No se pudo abrir esta canción."
      className="max-w-2xl"
      centered
    >
      {data ? (
        <>
          <RevealBlock>
            <p className="text-sm tracking-[0.18em] text-accent uppercase">Canción</p>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-stage-fg md:text-5xl">
              {data.track.title}
            </h1>
            <p className="mt-3 text-stage-muted">{data.track.subtitle}</p>
            <TrackPlayer key={data.track.id} track={data.track} />
          </RevealBlock>

          <RevealBlock>
            {data.lyrics ? (
              <p className="lyrics mt-10 text-left md:text-center">{data.lyrics}</p>
            ) : (
              <p className="mt-10 text-stage-muted">
                No encontramos la letra de esta canción.
              </p>
            )}
          </RevealBlock>
        </>
      ) : null}
    </DetailScreen>
  )
}
