type ProgressColor = 'primary' | 'success' | 'warning' | 'error';
type ProgressSize = 'sm' | 'md';

interface ProgressBarProps {
  value: number;
  size?: ProgressSize;
  color?: ProgressColor;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, size = 'md', color = 'primary', showLabel = false, className = '' }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorStyles: Record<ProgressColor, string> = {
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  const sizeStyles: Record<ProgressSize, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 rounded-full bg-surface-container-high overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-label-sm text-on-surface-variant shrink-0">{Math.round(clampedValue)}%</span>
      )}
    </div>
  );
}
