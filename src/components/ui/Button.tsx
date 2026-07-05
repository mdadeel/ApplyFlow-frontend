import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from '../../lib/icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

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
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary-container text-on-primary hover:bg-primary',
    secondary: 'bg-white border border-outline text-on-surface hover:bg-surface-container-low',
    ghost: 'text-on-surface-variant hover:bg-surface-container',
    danger: 'bg-error text-on-error hover:bg-red-700',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 gap-1.5 text-label-sm rounded',
    md: 'h-10 px-4 gap-2 rounded-lg',
    lg: 'h-12 px-6 gap-2.5 rounded-lg',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-label-md transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {!loading && icon}
      {children}
    </button>
  );
}
