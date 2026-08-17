import { apiDelete, apiGet, apiPost, apiPut } from '../../../config/api'
import type { LyricTagMark, Tag, TagScope } from '../interfaces/tag.interface'

export type TagWrite = Omit<Tag, 'id'>

export class TagsService {
  static list(scope?: TagScope, targetId?: string) {
    const params = new URLSearchParams()
    if (scope) {
      params.set('scope', scope)
    }
    if (targetId) {
      params.set('targetId', targetId)
    }
    const query = params.toString()
    const suffix = query ? `?${query}` : ''
    return apiGet<{ items: Tag[] }>(`/tags${suffix}`)
  }

  static create(tag: TagWrite) {
    return apiPost<Tag>('/tags', tag)
  }

  static update(id: number, tag: TagWrite) {
    return apiPut<Tag>(`/tags/${id}`, tag)
  }

  static remove(id: number) {
    return apiDelete<{ removed: boolean }>(`/tags/${id}`)
  }

  static marks(trackId: string) {
    return apiGet<{ items: LyricTagMark[] }>(`/tags/marks/${trackId}`)
  }

  static addMark(payload: {
    tagId: number
    spotifyId: string
    lineIndex: number
    startOffset: number
    endOffset: number
    excerpt: string
  }) {
    return apiPost<LyricTagMark>('/tags/marks', payload)
  }

  static removeMark(id: number) {
    return apiDelete<{ removed: boolean }>(`/tags/marks/${id}`)
  }
}
