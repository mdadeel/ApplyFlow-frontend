import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from '../../lib/icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inline' | 'icon' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm active:shadow-none',
  secondary: 'bg-white text-text-primary border border-border hover:border-primary hover:bg-primary hover:text-white active:bg-primary-hover shadow-sm',
  ghost: 'text-text-secondary hover:text-white hover:bg-primary active:bg-primary-hover',
  inline: 'text-primary hover:text-primary-hover underline-offset-2 hover:underline p-0',
  icon: 'text-text-secondary hover:text-white hover:bg-primary active:bg-primary-hover',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-sm active:shadow-none',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 gap-1.5 text-caption rounded-md',
  md: 'h-10 px-4 gap-2 text-body-sm rounded-md',
  lg: 'h-12 px-6 gap-2.5 rounded-md text-body-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isIconOnly = variant === 'icon';

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${variantStyles[variant]} ${isIconOnly ? 'h-10 w-10 p-0' : ''} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
