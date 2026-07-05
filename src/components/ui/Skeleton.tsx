type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  const base = 'animate-pulse bg-surface-container-high';

  const variantStyles: Record<SkeletonVariant, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const resolvedWidth = width ?? (variant === 'circular' ? 40 : '100%');
  const resolvedHeight = height ?? (variant === 'text' ? 16 : variant === 'circular' ? 40 : 100);

  return (
    <div
      className={`${base} ${variantStyles[variant]} ${className}`}
      style={{ width: resolvedWidth, height: resolvedHeight }}
    />
  );
}
