import { type ReactNode } from 'react'
import { Button } from '../ui/Button'

interface SectionAction {
  label: string
  onClick: () => void
}

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  action?: SectionAction
  className?: string
}

export function Section({
  title,
  description,
  children,
  action,
  className = '',
}: SectionProps) {
  return (
    <section className={`space-y-md ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            {title && (
              <h2 className="text-headline-md text-on-surface">{title}</h2>
            )}
            {description && (
              <p className="text-body-md text-on-surface-variant">
                {description}
              </p>
            )}
          </div>
          {action && (
            <Button variant="ghost" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
