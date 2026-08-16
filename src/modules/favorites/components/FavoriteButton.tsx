import { Star } from 'lucide-react'
import { cx } from '../../../shared/lib/cx'
import type { CatalogItem } from '../../home/interfaces/search.interface'
import { useFavorites } from '../FavoritesContext'

export function FavoriteButton({
  item,
  className,
}: {
  item: CatalogItem
  className?: string
}) {
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(item)

  return (
    <button
      type="button"
      className={cx(
        'grid h-8 w-8 place-items-center rounded-full bg-stage/70 text-accent backdrop-blur-sm transition-transform hover:scale-110 active:scale-95',
        className,
      )}
      aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void toggle(item)
      }}
    >
      <Star size={15} fill={active ? 'currentColor' : 'none'} strokeWidth={active ? 0 : 2} />
    </button>
  )
}
