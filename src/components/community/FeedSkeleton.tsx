import { Skeleton } from '../ui/Skeleton'

interface FeedSkeletonProps {
  count?: number
  className?: string
}

/**
 * Placeholder shown while a feed tab is loading.
 * Renders `count` skeleton cards (default 5) with title + summary + action
 * placeholders, matching the FeedItem layout.
 */
export function FeedSkeleton({ count = 5, className = '' }: FeedSkeletonProps) {
  return (
    <div
      data-testid="feed-skeleton"
      aria-busy="true"
      aria-live="polite"
      className={`flex flex-col gap-3 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <Skeleton variant="circular" width={36} height={36} />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton variant="text" width="65%" height={16} />
              <Skeleton variant="text" width="90%" height={14} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <Skeleton variant="text" width={96} height={12} />
            <Skeleton variant="rectangular" width={80} height={28} className="rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
