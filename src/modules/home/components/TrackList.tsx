import { Link } from 'react-router-dom'
import { itemPath } from '../itemPath'
import type { CatalogItem } from '../interfaces/search.interface'

export function TrackList({ items }: { items: CatalogItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-stage-muted">No hay canciones para mostrar.</p>
  }

  return (
    <ol className="divide-y divide-line/60">
      {items.map((item, index) => (
        <li key={item.id}>
          <Link
            to={itemPath(item)}
            className="flex items-center gap-4 py-3 text-left transition-colors hover:text-accent"
          >
            <span className="w-6 shrink-0 text-sm text-stage-muted">{index + 1}</span>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-lg object-cover"
              />
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-stage-fg">{item.title}</span>
              <span className="block truncate text-sm text-stage-muted">{item.subtitle}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
