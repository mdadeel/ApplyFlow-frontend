import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

export function Input({
  label,
  error,
  icon,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-label-md text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full h-10 rounded-lg border bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors duration-150
            ${icon ? 'pl-10' : 'pl-3'} pr-3
            ${error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
            }
            disabled:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-label-sm text-error">{error}</p>}
      {helperText && !error && <p className="text-label-sm text-on-surface-variant">{helperText}</p>}
    </div>
  );
}
