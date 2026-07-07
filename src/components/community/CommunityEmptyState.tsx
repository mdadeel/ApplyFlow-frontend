import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { LucideIcon } from '../../lib/icons'

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
}

export interface CommunityEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  example?: ReactNode
}

export function CommunityEmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  example,
}: CommunityEmptyStateProps) {
  const renderAction = (
    action: EmptyStateAction,
    variant: 'primary' | 'secondary',
  ) => {
    const className =
      variant === 'primary'
        ? 'inline-flex items-center justify-center h-10 px-4 gap-2 rounded-lg font-label-md bg-primary-container text-on-primary hover:bg-primary transition-all duration-150 active:scale-[0.97]'
        : 'inline-flex items-center justify-center h-10 px-4 gap-2 rounded-lg font-label-md bg-white border border-outline text-on-surface hover:bg-surface-container-low transition-all duration-150 active:scale-[0.97]'

    if (action.href) {
      return (
        <Link to={action.href} className={className}>
          {action.label}
        </Link>
      )
    }

    return (
      <Button variant={variant} onClick={action.onClick}>
        {action.label}
      </Button>
    )
  }

  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center text-center py-xl px-md max-w-xl mx-auto"
    >
      <div className="mb-4 text-on-surface-variant">
        <Icon className="w-12 h-12" aria-hidden="true" />
      </div>
      <h3 className="text-headline-md text-on-surface font-semibold mb-1">
        {title}
      </h3>
      <p className="text-body-md text-on-surface-variant mb-4">{description}</p>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {primaryAction && renderAction(primaryAction, 'primary')}
          {secondaryAction && renderAction(secondaryAction, 'secondary')}
        </div>
      )}
      {example && (
        <div
          data-testid="empty-state-example"
          className="mt-6 w-full p-4 rounded-xl border border-outline-variant bg-surface-container-low text-left"
        >
          {example}
        </div>
      )}
    </div>
  )
}
