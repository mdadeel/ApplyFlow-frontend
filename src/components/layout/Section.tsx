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
  titleClassName?: string
  descriptionClassName?: string
}

export function Section({
  title,
  description,
  children,
  action,
  className = '',
  titleClassName = 'text-heading-3',
  descriptionClassName = 'text-body-sm',
}: SectionProps) {
  return (
    <section className={`space-y-md ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            {title && (
              <h2 className={`${titleClassName} text-text-primary`}>{title}</h2>
            )}
            {description && (
              <p className={`${descriptionClassName} text-text-secondary`}>
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
