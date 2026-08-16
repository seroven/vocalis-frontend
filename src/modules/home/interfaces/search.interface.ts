export type CatalogItemType = 'track' | 'album' | 'artist'

export type SearchFilter = CatalogItemType | 'all'

export interface CatalogItem {
  id: string
  type: CatalogItemType
  title: string
  subtitle: string
  imageUrl: string | null
}

export interface CatalogSearchData {
  items: CatalogItem[]
}
