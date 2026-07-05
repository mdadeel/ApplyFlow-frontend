import { X } from '../../lib/icons';

type ChipVariant = 'default' | 'primary';
type ChipSize = 'sm' | 'md';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  className?: string;
}

export function Chip({ label, onRemove, variant = 'default', size = 'md', className = '' }: ChipProps) {
  const variantStyles: Record<ChipVariant, string> = {
    default: 'bg-surface-container text-on-surface-variant border border-outline-variant',
    primary: 'bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim',
  };

  const sizeStyles: Record<ChipSize, string> = {
    sm: 'px-2 py-0.5 text-label-sm',
    md: 'px-2.5 py-1 text-label-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
