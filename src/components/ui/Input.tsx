import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-caption text-text-secondary font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-10 px-3 rounded-md border bg-neutral-50 border-neutral-300 text-text-primary text-body-sm placeholder:text-text-tertiary outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary ${error ? 'border-danger' : 'hover:border-neutral-400'} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-meta text-danger">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
