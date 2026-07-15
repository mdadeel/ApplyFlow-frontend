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
  default: 'bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300',
  hero: 'bg-surface border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300',
  compact: 'bg-surface border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300',
  stat: 'bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300',
  timeline: 'bg-surface border-y border-r border-border border-l-4 border-l-primary rounded-r-xl pl-6 py-5 pr-5 shadow-sm hover:shadow-md transition-all duration-300',
  ai: 'bg-gradient-to-br from-surface-secondary to-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300',
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
