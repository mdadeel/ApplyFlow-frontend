interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const dotColors: Record<string, string> = {
  submitted: 'bg-success',
  draft: 'bg-warning',
  interview: 'bg-primary',
  offer: 'bg-success',
  rejected: 'bg-danger',
  expired: 'bg-neutral-300',
};

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const dotColor = dotColors[status] || 'bg-neutral-300';

  return (
    <span className={`inline-flex items-center gap-1.5 text-caption text-text-secondary ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {label || status}
    </span>
  );
}
