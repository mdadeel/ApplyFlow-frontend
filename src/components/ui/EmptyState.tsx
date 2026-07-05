import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-xl px-md text-center">
      {icon && (
        <div className="mb-4 text-on-surface-variant">
          {icon}
        </div>
      )}
      <h3 className="font-headline-md text-on-surface mb-1">{title}</h3>
      <p className="text-body-md text-on-surface-variant max-w-sm mb-4">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
