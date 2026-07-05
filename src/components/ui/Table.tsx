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
    <div className={`overflow-x-auto rounded-xl border border-outline-variant ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-container-low">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-label-sm font-medium text-on-surface-variant ${col.sortable ? 'cursor-pointer hover:text-on-surface select-none' : ''}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="inline-flex flex-col leading-none">
                      <ChevronUp className={`h-3 w-3 -mb-0.5 ${sortField === col.key && sortDir === 'asc' ? 'text-primary' : 'text-outline'}`} />
                      <ChevronDown className={`h-3 w-3 ${sortField === col.key && sortDir === 'desc' ? 'text-primary' : 'text-outline'}`} />
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
              <tr key={i} className="border-t border-outline-variant">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton variant="text" width="80%" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-body-md text-on-surface-variant">
                No data
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr key={i} className="border-t border-outline-variant hover:bg-surface-container-low transition-colors">
                {columns.map((col) => {
                  const value = item[col.key];
                  return (
                    <td key={col.key} className="px-4 py-3 text-body-md text-on-surface">
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
