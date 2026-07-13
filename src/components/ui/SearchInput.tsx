import { Search } from '../../lib/icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 pl-10 pr-3 rounded-lg border border-neutral-300 bg-neutral-50 text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-150 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 hover:border-neutral-400"
      />
    </div>
  );
}
