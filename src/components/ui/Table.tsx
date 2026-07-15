import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from '../../lib/icons';
import { Skeleton } from './Skeleton';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string) => void;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  loading?: boolean;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onSort,
  sortField,
  sortDir,
  loading = false,
  className = '',
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-border bg-surface shadow-card ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-secondary border-b border-border">
            {columns.map((col) => (                <th
                key={col.key}
                scope="col"
                className={`px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary ${col.sortable ? 'cursor-pointer hover:text-text-primary select-none' : ''}`}
                onClick={() => col.sortable && onSort?.(col.key)}
                aria-sort={col.sortable && sortField === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="inline-flex flex-col leading-none">
                      <ChevronUp className={`h-3 w-3 -mb-0.5 ${sortField === col.key && sortDir === 'asc' ? 'text-primary' : 'text-text-tertiary'}`} />
                      <ChevronDown className={`h-3 w-3 ${sortField === col.key && sortDir === 'desc' ? 'text-primary' : 'text-text-tertiary'}`} />
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-border">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    <Skeleton variant="text" width="80%" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-body-md text-text-secondary">
                No data
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr key={i} className="border-t border-border hover:bg-surface-secondary/50 transition-all duration-200">
                {columns.map((col) => {
                  const value = item[col.key];
                  return (
                    <td key={col.key} className="px-6 py-4 text-body-sm text-text-primary">
                      {col.render ? col.render(item) : value != null ? String(value) : ''}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
