import { AnimatePresence, motion } from 'framer-motion'
import { Highlighter, ScanText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLoaderGate } from '../../brand/BrandLoader'
import { DetailScreen, RevealBlock } from '../../shared/components/DetailScreen'
import { Button } from '../../shared/components/Button'
import { pageEase, pageMotion } from '../../shared/lib/page-motion'
import { FocusMode } from '../lyrics/components/FocusMode'
import { LyricsKaraoke } from '../lyrics/components/LyricsKaraoke'
import { splitLyricLines } from '../lyrics/interfaces/lyrics-sync.interface'
import { TrackPlayer } from '../player/components/TrackPlayer'
import { useSpotifyPlayer } from '../player/hooks/useSpotifyPlayer'
import type { TrackPageData } from '../home/interfaces/search.interface'
import { SpotifyService } from '../home/services/SpotifyService'
import { TagsMenu } from '../tags/components/TagsPanel'
import { useLyricMarks, useTags } from '../tags/hooks/useTags'
import { TagsService } from '../tags/services/TagsService'

export function TrackPage() {
  const { id } = useParams()
  const [data, setData] = useState<TrackPageData | null>(null)
  const [error, setError] = useState(false)
  const [focus, setFocus] = useState(false)
  const [tagging, setTagging] = useState(false)
  const ready = useLoaderGate(Boolean(data), id)
  const player = useSpotifyPlayer(data?.track.id, data?.track.durationMs ?? 0)
  const { tags, setTags } = useTags('track', id)
  const { marks, setMarks } = useLyricMarks(data?.track.id)

  useEffect(() => {
    setFocus(false)
    setTagging(false)
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={pageMotion.transition}
          className="flex min-h-full w-full flex-1 flex-col"
        >
          <DetailScreen
            ready={ready && Boolean(data)}
            error={error}
            errorMessage="No se pudo abrir esta canción."
            className="w-full"
            centered
            pinToolbar
            actions={
              <div className="flex items-center gap-1.5">
                <TagsMenu
                  tags={tags}
                  target={
                    data
                      ? { id: data.track.id, name: data.track.title, scope: 'track' }
                      : { id: id ?? '', name: 'Canción', scope: 'track' }
                  }
                  onCreated={(tag) => setTags((current) => [tag, ...current])}
                />
                {data?.lyrics ? (
                  <>
                    <Button
                      variant="icon"
                      aria-label="Editar etiquetas"
                      aria-pressed={tagging}
                      className={tagging ? 'text-accent' : undefined}
                      onClick={() => setTagging((current) => !current)}
                    >
                      <Highlighter size={18} />
                    </Button>
                    <Button
                      variant="icon"
                      aria-label="Focus mode"
                      onClick={() => setFocus(true)}
                    >
                      <ScanText size={18} />
                    </Button>
                  </>
                ) : null}
              </div>
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
                  <AnimatePresence initial={false}>
                    {tagging ? (
                      <motion.div
                        key="tagging-hint"
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: pageEase }}
                      >
                        <p className="mt-8 text-sm text-stage-muted">
                          Selecciona un trozo de letra y elige una etiqueta. Toca una marca para
                          quitarla.
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  {data.lyrics ? (
                    <motion.div layout transition={{ duration: 0.32, ease: pageEase }}>
                    <LyricsKaraoke
                      lines={splitLyricLines(data.lyrics)}
                      follow={false}
                      marks={marks}
                      tags={tags}
                      editing={tagging}
                      onApplyTag={(lineIndex, start, end, excerpt, tagId) => {
                        void TagsService.addMark({
                          tagId,
                          spotifyId: data.track.id,
                          lineIndex,
                          startOffset: start,
                          endOffset: end,
                          excerpt,
                        }).then((response) => {
                          setMarks((current) => [...current, response.data])
                        })
                      }}
                      onRemoveTag={(markId) => {
                        void TagsService.removeMark(markId).then(() => {
                          setMarks((current) => current.filter((mark) => mark.id !== markId))
                        })
                      }}
                      onTagCreated={(tag) => setTags((current) => [tag, ...current])}
                      target={
                        data
                          ? { id: data.track.id, name: data.track.title, scope: 'track' }
                          : undefined
                      }
                    />
                    </motion.div>
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
