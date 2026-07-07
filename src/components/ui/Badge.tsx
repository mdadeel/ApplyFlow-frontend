import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  default: 'bg-surface-secondary text-text-secondary border border-border',
  success: 'bg-green-50 text-success border border-green-200',
  warning: 'bg-amber-50 text-warning border border-amber-200',
  danger: 'bg-red-50 text-danger border border-red-200',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-meta font-medium rounded-full ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
