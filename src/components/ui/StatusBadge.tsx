import type { ApplicationStatus } from '../../types';
import { Badge } from './Badge';

const statusConfig: Record<ApplicationStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'error' | 'info' }> = {
  draft: { label: 'Draft', variant: 'default' },
  analyzing: { label: 'Analyzing', variant: 'default' },
  planning: { label: 'Planning', variant: 'default' },
  generating: { label: 'Generating', variant: 'default' },
  reviewing: { label: 'Reviewing', variant: 'info' },
  ready: { label: 'Ready', variant: 'info' },
  exported: { label: 'Exported', variant: 'default' },
  applied: { label: 'Applied', variant: 'default' },
  interview: { label: 'Interview', variant: 'warning' },
  assessment: { label: 'Assessment', variant: 'warning' },
  offer: { label: 'Offer', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  ghosted: { label: 'Ghosted', variant: 'error' },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
