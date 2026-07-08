import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
  noCard?: boolean;
}

export function EmptyState({ icon, title, description, action, secondaryAction, className = '', noCard = false }: EmptyStateProps) {
  const containerClass = noCard
    ? `flex flex-col items-center justify-center text-center py-16 px-6 ${className}`
    : `flex flex-col items-center justify-center text-center py-12 px-6 bg-white border border-border rounded-xl shadow-card max-w-2xl mx-auto w-full ${className}`;

  return (
    <div className={containerClass}>
      {icon && (
        <div className="mb-4 p-3 bg-neutral-50 text-text-secondary rounded-full inline-flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <h3 className="text-heading-3 text-text-primary mb-2 font-semibold">{title}</h3>
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
