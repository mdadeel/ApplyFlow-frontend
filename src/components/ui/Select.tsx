import { ChevronDown } from '../../lib/icons';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

export function Select({ label, options, value, onChange, error, placeholder, className = '' }: SelectProps) {
  const selectId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-caption text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && selectId ? `${selectId}-error` : undefined}
          className={`w-full h-10 appearance-none rounded-lg border bg-neutral-50 border-neutral-300 text-body-sm text-text-primary outline-none transition-colors duration-150 pl-3 pr-10 cursor-pointer
            ${error
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 hover:border-neutral-400'
            }
            disabled:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
      </div>
      {error && (
        <p id={selectId ? `${selectId}-error` : undefined} className="text-label-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
