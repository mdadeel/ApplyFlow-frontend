import type { LucideIcon } from '../../lib/icons';
import { ArrowUp, ArrowDown } from '../../lib/icons';

type AccentColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

const borderAccents: Record<AccentColor, string> = {
  primary: 'border-l-primary/80 hover:border-primary',
  success: 'border-l-emerald-500/80 hover:border-emerald-500',
  warning: 'border-l-amber-500/80 hover:border-amber-500',
  error: 'border-l-red-500/80 hover:border-red-500',
  info: 'border-l-blue-500/80 hover:border-blue-500',
};

const iconColors: Record<AccentColor, string> = {
  primary: 'text-primary bg-primary/10 dark:bg-primary/20',
  success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20',
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20',
  error: 'text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20',
  info: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20',
};

const hoverGlows: Record<AccentColor, string> = {
  primary: 'hover:shadow-[0_0_20px_-3px_rgba(0,74,198,0.15)] hover:border-primary/40',
  success: 'hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.15)] hover:border-emerald-500/40',
  warning: 'hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.15)] hover:border-amber-500/40',
  error: 'hover:shadow-[0_0_20px_-3px_rgba(239,68,68,0.15)] hover:border-red-500/40',
  info: 'hover:shadow-[0_0_20px_-3px_rgba(59,130,246,0.15)] hover:border-blue-500/40',
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; trend: 'up' | 'down' };
  icon: LucideIcon;
  description?: string;
  accentColor?: AccentColor;
}

export function StatCard({ title, value, change, icon: Icon, description, accentColor = 'primary' }: StatCardProps) {
  return (
    <div className={`bg-surface border border-outline-variant rounded-xl p-sm border-l-4 ${borderAccents[accentColor]} ${hoverGlows[accentColor]} transition-all duration-300 hover:bg-gradient-to-br hover:from-surface hover:to-surface-container-low/30 group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-label-sm text-on-surface-variant font-medium tracking-wide uppercase">{title}</p>
          <p className="text-headline-md font-bold text-on-surface tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconColors[accentColor]} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-outline-variant/30">
          {change.trend === 'up' ? (
            <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={`text-label-sm font-semibold ${change.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {change.value}%
          </span>
          {description && <span className="text-label-sm text-on-surface-variant/80 ml-1">{description}</span>}
        </div>
      )}
    </div>
  );
}
