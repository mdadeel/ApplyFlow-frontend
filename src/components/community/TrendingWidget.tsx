import type { ReactNode } from 'react'
import { ArrowRight, TrendingUp } from '../../lib/icons'

interface TrendingWidgetProps {
  title: string
  description?: string
  action?: { label: string; href: string }
  emptyLabel?: string
  children?: ReactNode
  className?: string
}

/**
 * Card wrapper used for every block in the Trending tab.
 * Children render the widget body (chart, list, range bars, etc).
 */
export function TrendingWidget({
  title,
  description,
  action,
  emptyLabel,
  children,
  className = '',
}: TrendingWidgetProps) {
  return (
    <section
      data-testid="trending-widget"
      className={`bg-surface border border-outline-variant rounded-xl p-4 flex flex-col gap-3 ${className}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-headline-sm text-on-surface font-semibold flex items-center gap-2">
            <TrendingUp size={16} aria-hidden="true" className="text-primary" />
            {title}
          </h3>
          {description && (
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {description}
            </p>
          )}
        </div>
        {action && (
          <a
            href={action.href}
            className="inline-flex items-center gap-1 text-label-sm text-primary hover:underline shrink-0"
          >
            {action.label}
            <ArrowRight size={12} aria-hidden="true" />
          </a>
        )}
      </header>
      <div className="flex-1">
        {children ?? (
          <p className="text-body-sm text-on-surface-variant italic">
            {emptyLabel ?? 'No data yet'}
          </p>
        )}
      </div>
    </section>
  )
}
