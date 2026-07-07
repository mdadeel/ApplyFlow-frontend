import type { ReactNode } from 'react';

type CardVariant = 'default' | 'hero' | 'compact' | 'stat' | 'timeline' | 'ai';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-border rounded-lg p-5',
  hero: 'bg-white border border-border rounded-xl p-8',
  compact: 'bg-white border border-border rounded-md p-3',
  stat: 'bg-white border border-border rounded-lg p-5',
  timeline: 'bg-white border-l-2 border-primary pl-5 py-4 pr-4',
  ai: 'bg-gradient-to-br from-blue-50 to-white border border-primary/20 rounded-lg p-5',
};

export function Card({ children, variant = 'default', className = '', hover = false, onClick }: CardProps) {
  const isInteractive = onClick || hover;

  return (
    <div
      className={`${variantStyles[variant]} ${isInteractive ? 'cursor-pointer' : ''} ${hover && !onClick ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
