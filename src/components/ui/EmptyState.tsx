import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, secondaryAction, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {icon && (
        <div className="mb-4 text-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="text-heading-3 text-text-primary mb-2">{title}</h3>
      <p className="text-body-sm text-text-secondary max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {action && (
          <Button variant="primary" onClick={action.onClick}>{action.label}</Button>
        )}
        {secondaryAction && (
          <Button variant="ghost" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
        )}
      </div>
    </div>
  );
}
