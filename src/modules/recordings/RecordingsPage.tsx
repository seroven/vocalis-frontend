import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Music2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BackButton } from '../../shared/components/BackButton'
import { Button, ButtonLink } from '../../shared/components/Button'
import { pageEase } from '../../shared/lib/page-motion'
import { RecordingPlayer } from './components/RecordingPlayer'
import { RecordingTitle } from './components/RecordingTitle'
import type { RecordingTrackGroup } from './interfaces/recording.interface'
import { RecordingsService } from './services/RecordingsService'

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? 'toma' : 'tomas'}`
}

export function RecordingsPage() {
  const [groups, setGroups] = useState<RecordingTrackGroup[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void RecordingsService.list()
      .then((response) => {
        if (!cancelled) {
          setGroups(response.data.items)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGroups([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleRemove(groupId: string, recordingId: number) {
    await RecordingsService.remove(recordingId)
    setGroups((current) =>
      current
        .map((group) =>
          group.spotifyId === groupId
            ? {
                ...group,
                recordings: group.recordings.filter((item) => item.id !== recordingId),
              }
            : group,
        )
        .filter((group) => group.recordings.length > 0),
    )
  }

  return (
    <section className="w-full">
      <BackButton />
      <h1 className="mt-6 text-center font-display text-5xl tracking-tight text-stage-fg md:text-6xl">
        Mis grabaciones
      </h1>
      <p className="mt-3 text-center text-stage-muted">
        Escucha las tomas que guardaste en cada canción.
      </p>

      <div className="mt-10 space-y-4">
        {!ready ? (
          <p className="text-center text-sm text-stage-muted">Cargando grabaciones…</p>
        ) : groups.length === 0 ? (
          <p className="text-center text-sm text-stage-muted">
            Aún no tienes grabaciones. Ábrela desde una canción.
          </p>
        ) : (
          groups.map((group) => {
            const open = openId === group.spotifyId
            const initial = group.title.trim().charAt(0).toUpperCase() || '?'

            return (
              <article key={group.spotifyId} className="panel overflow-hidden rounded-[1.8rem]">
                <button
                  type="button"
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  onClick={() =>
                    setOpenId((current) => (current === group.spotifyId ? null : group.spotifyId))
                  }
                >
                  {group.imageUrl ? (
                    <img
                      src={group.imageUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent-soft font-display text-xl text-accent">
                      {initial}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-stage-fg">
                      {group.title}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-stage-muted">
                      {group.artistName} · {countLabel(group.recordings.length)}
                    </span>
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-stage-muted transition-transform duration-300 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: pageEase }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 border-t border-line/60 px-5 pt-4 pb-5">
                        <ButtonLink
                          variant="ghost"
                          className="w-auto"
                          to={`/cancion/${group.spotifyId}`}
                        >
                          <Music2 size={15} />
                          Ir a la canción
                        </ButtonLink>
                        {group.recordings.map((item, index) => (
                          <div
                            key={item.id}
                            className="rounded-2xl bg-stage-fg/5 px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <RecordingTitle
                                  take={item}
                                  fallback={`Toma ${index + 1}`}
                                  onRenamed={(title) =>
                                    setGroups((current) =>
                                      current.map((entry) =>
                                        entry.spotifyId === group.spotifyId
                                          ? {
                                              ...entry,
                                              recordings: entry.recordings.map((recording) =>
                                                recording.id === item.id
                                                  ? { ...recording, title }
                                                  : recording,
                                              ),
                                            }
                                          : entry,
                                      ),
                                    )
                                  }
                                />
                                <p className="text-sm text-stage-muted">
                                  {formatDate(item.createdAt)} · {formatDuration(item.durationMs)}
                                </p>
                              </div>
                              <Button
                                variant="icon"
                                aria-label="Borrar grabación"
                                className="h-9 w-9"
                                onClick={() => void handleRemove(group.spotifyId, item.id)}
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                            <div className="mt-3">
                              <RecordingPlayer id={item.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
