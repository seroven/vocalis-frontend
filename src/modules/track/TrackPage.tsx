import { AnimatePresence, motion } from 'framer-motion'
import { ScanText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLoaderGate } from '../../brand/BrandLoader'
import { DetailScreen, RevealBlock } from '../../shared/components/DetailScreen'
import { Button } from '../../shared/components/Button'
import { pageMotion } from '../../shared/lib/page-motion'
import { FocusMode } from '../lyrics/components/FocusMode'
import { LyricsKaraoke } from '../lyrics/components/LyricsKaraoke'
import { splitLyricLines } from '../lyrics/interfaces/lyrics-sync.interface'
import { TrackPlayer } from '../player/components/TrackPlayer'
import { useSpotifyPlayer } from '../player/hooks/useSpotifyPlayer'
import type { TrackPageData } from '../home/interfaces/search.interface'
import { SpotifyService } from '../home/services/SpotifyService'

export function TrackPage() {
  const { id } = useParams()
  const [data, setData] = useState<TrackPageData | null>(null)
  const [error, setError] = useState(false)
  const [focus, setFocus] = useState(false)
  const ready = useLoaderGate(Boolean(data), id)
  const player = useSpotifyPlayer(data?.track.id, data?.track.durationMs ?? 0)

  useEffect(() => {
    setFocus(false)
  }, [id])

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
    <AnimatePresence mode="wait" initial={false}>
      {focus && data?.lyrics ? (
        <FocusMode
          key="focus"
          track={data.track}
          lyrics={data.lyrics}
          player={player}
          onClose={() => setFocus(false)}
        />
      ) : (
        <motion.div
          key="track"
          {...pageMotion}
          className="flex min-h-full w-full flex-1 flex-col"
        >
          <DetailScreen
            ready={ready && Boolean(data)}
            error={error}
            errorMessage="No se pudo abrir esta canción."
            className="max-w-2xl"
            centered
            actions={
              data?.lyrics ? (
                <Button
                  variant="icon"
                  aria-label="Focus mode"
                  onClick={() => setFocus(true)}
                >
                  <ScanText size={18} />
                </Button>
              ) : null
            }
          >
            {data ? (
              <>
                <RevealBlock>
                  <p className="text-sm tracking-[0.18em] text-accent uppercase">Canción</p>
                  <h1 className="mt-3 font-display text-4xl tracking-tight text-stage-fg md:text-5xl">
                    {data.track.title}
                  </h1>
                  <p className="mt-3 text-stage-muted">{data.track.subtitle}</p>
                  <TrackPlayer track={data.track} player={player} />
                </RevealBlock>

                <RevealBlock>
                  {data.lyrics ? (
                    <LyricsKaraoke lines={splitLyricLines(data.lyrics)} follow={false} />
                  ) : (
                    <p className="mt-10 text-stage-muted">
                      No encontramos la letra de esta canción.
                    </p>
                  )}
                </RevealBlock>
              </>
            ) : null}
          </DetailScreen>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
