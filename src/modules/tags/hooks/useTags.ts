import { useEffect, useState } from 'react'
import type { LyricTagMark, Tag, TagScope } from '../interfaces/tag.interface'
import { TagsService } from '../services/TagsService'

export function useTags(scope?: TagScope, targetId?: string) {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    let cancelled = false

    void TagsService.list(scope, targetId)
      .then((response) => {
        if (!cancelled) {
          setTags(response.data.items)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTags([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [scope, targetId])

  return { tags, setTags }
}

export function useLyricMarks(trackId?: string) {
  const [marks, setMarks] = useState<LyricTagMark[]>([])

  useEffect(() => {
    if (!trackId) {
      setMarks([])
      return
    }

    let cancelled = false

    void TagsService.marks(trackId)
      .then((response) => {
        if (!cancelled) {
          setMarks(response.data.items)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarks([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [trackId])

  return { marks, setMarks }
}
