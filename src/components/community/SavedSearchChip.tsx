import { X } from '../../lib/icons'
import type { SavedSearch } from '../../services/community/savedSearches'

export interface SavedSearchChipProps {
  search: SavedSearch
  onClick: () => void
  onDelete: () => void
}

export function SavedSearchChip({ search, onClick, onDelete }: SavedSearchChipProps) {
  return (
    <span
      data-testid="saved-search-chip"
      className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm border border-outline-variant"
    >
      <button
        type="button"
        onClick={onClick}
        className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
        aria-label={`Apply saved search ${search.name}`}
      >
        {search.name}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-on-secondary-container/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Delete saved search ${search.name}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
