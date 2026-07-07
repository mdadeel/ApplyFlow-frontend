import { ChevronLeft, ChevronRight } from '../../lib/icons';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(page: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (page > 3) pages.push('ellipsis');

  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (page < total - 2) pages.push('ellipsis');

  pages.push(total);
  return pages;
}

export function Pagination({ page, pages: totalPages, total, onChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className="text-meta text-text-tertiary">
        {total} result{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-text-tertiary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageNumbers.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center h-8 w-8 text-meta text-text-tertiary">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-meta font-medium transition-colors
                ${p === page
                  ? 'bg-primary text-white'
                  : 'text-text-tertiary hover:bg-surface-secondary'
                }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-text-tertiary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
