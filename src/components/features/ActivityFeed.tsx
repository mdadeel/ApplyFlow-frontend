import { Skeleton } from '../ui/Skeleton';
import { Clock } from '../../lib/icons';

interface ActivityItem {
  id: string;
  action: string;
  target: string;
  date: string;
  type: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  loading?: boolean;
}

const dotTypeColors: Record<string, string> = {
  application: 'bg-blue-500',
  status: 'bg-amber-500',
  interview: 'bg-purple-500',
  note: 'bg-emerald-500',
  export: 'bg-surface-container-high',
  error: 'bg-red-500',
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function ActivityFeed({ items, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton variant="circular" width={8} height={8} className="mt-2 shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-xl text-center">
        <Clock className="h-8 w-8 text-on-surface-variant mb-2" />
        <p className="text-body-md text-on-surface-variant">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {items.map((item) => {
        const dotColor = dotTypeColors[item.type] || 'bg-surface-container-high';
        return (
          <div key={item.id} className="flex items-start gap-3 px-1 py-2 rounded-lg hover:bg-surface-container-low transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dotColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-body-md text-on-surface">
                {item.action} <span className="font-medium">{item.target}</span>
              </p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">{timeAgo(item.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
