import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const isInteractive = onClick || hover;

  return (
    <div
      className={`bg-surface border border-outline-variant p-md rounded-xl ${isInteractive ? 'cursor-pointer' : ''} ${hover && !onClick ? 'hover:border-outline hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
