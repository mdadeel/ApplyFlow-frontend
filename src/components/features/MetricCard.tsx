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
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
      <div className="p-md">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <p className="text-label-md text-on-surface-variant">{title}</p>
            <p className="text-headline-lg font-semibold text-on-surface">{value}</p>
            {subtitle && <p className="text-body-md text-on-surface-variant">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBgAccents[color]} text-white shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
      {children && (
        <div className="border-t border-outline-variant p-md bg-surface-container-low">
          {children}
        </div>
      )}
    </div>
  );
}
