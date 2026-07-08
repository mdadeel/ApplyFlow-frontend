import type { ReactNode } from 'react';
import type { LucideIcon } from '../../lib/icons';

type AccentColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

const iconBgAccents: Record<AccentColor, string> = {
  primary: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: AccentColor;
  children?: ReactNode;
}

export function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary', children }: MetricCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-caption text-text-secondary uppercase tracking-wider font-semibold">{title}</p>
            <p className="text-headline-lg font-bold text-text-primary">{value}</p>
            {subtitle && <p className="text-body-sm text-text-tertiary">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${iconBgAccents[color]} text-white shrink-0 shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
      {children && (
        <div className="border-t border-border p-5 bg-surface-secondary">
          {children}
        </div>
      )}
    </div>
  );
}
