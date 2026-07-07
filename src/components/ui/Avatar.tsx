import { getInitials } from '../../lib/format'

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeStyles: Record<AvatarSize, string> = {
    sm: 'h-8 w-8 text-label-sm',
    md: 'h-10 w-10 text-label-md',
    lg: 'h-12 w-12 text-headline-md',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium bg-primary-container text-on-primary ${sizeStyles[size]} ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
