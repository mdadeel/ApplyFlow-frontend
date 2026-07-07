import { X } from '../../lib/icons';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function Chip({ label, onRemove, className = '' }: ChipProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-caption text-text-secondary bg-surface-secondary border border-border rounded-full font-medium ${className}`}>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:text-text-primary transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
