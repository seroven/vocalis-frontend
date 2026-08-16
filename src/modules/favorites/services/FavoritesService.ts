import { apiDelete, apiGet, apiPost } from '../../../config/api'
import type {
  CatalogItem,
  CatalogSearchData,
  SearchFilter,
} from '../../home/interfaces/search.interface'

export class FavoritesService {
  static list(type: SearchFilter = 'all', query = '') {
    const params = new URLSearchParams()

    if (type !== 'all') {
      params.set('type', type)
    }

    if (query.trim()) {
      params.set('q', query.trim())
    }

    const suffix = params.toString()
    return apiGet<CatalogSearchData>(`/favorites${suffix ? `?${suffix}` : ''}`)
  }

  static add(item: CatalogItem) {
    const spotifyId = item.id.split(':')[1] ?? item.id

    return apiPost<CatalogItem>('/favorites', {
      type: item.type,
      spotifyId,
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
    })
  }

  static remove(item: CatalogItem) {
    const spotifyId = item.id.split(':')[1] ?? item.id
    return apiDelete<{ removed: boolean }>(`/favorites/${item.type}/${spotifyId}`)
  }
}
