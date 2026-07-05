import type { TimelineEvent, ApplicationStatus } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface TimelineEventItem extends TimelineEvent {
  status: ApplicationStatus;
}

interface TimelineProps {
  events: TimelineEventItem[];
  loading?: boolean;
}

const statusDotBorder: Record<string, string> = {
  draft: 'border-surface-container-high',
  analyzing: 'border-surface-container-high',
  planning: 'border-surface-container-high',
  generating: 'border-surface-container-high',
  reviewing: 'border-blue-500',
  ready: 'border-blue-500',
  exported: 'border-surface-container-high',
  applied: 'border-surface-container-high',
  interview: 'border-amber-500',
  assessment: 'border-amber-500',
  offer: 'border-emerald-500',
  rejected: 'border-red-500',
  ghosted: 'border-red-500',
};

const statusDotFill: Record<string, string> = {
  draft: 'bg-surface-container-high',
  analyzing: 'bg-surface-container-high',
  planning: 'bg-surface-container-high',
  generating: 'bg-surface-container-high',
  reviewing: 'bg-blue-500',
  ready: 'bg-blue-500',
  exported: 'bg-surface-container-high',
  applied: 'bg-surface-container-high',
  interview: 'bg-amber-500',
  assessment: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-500',
  ghosted: 'bg-red-500',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Timeline({ events, loading }: TimelineProps) {
  if (loading) {
    return (
      <div className="space-y-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton variant="circular" width={12} height={12} className="mt-1 shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-xl text-center">
        <p className="text-body-md text-on-surface-variant">No timeline events yet.</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-outline-variant" />
      <div className="space-y-0">
        {sortedEvents.map((event, index) => {
          const isLatest = index === 0;
          const borderColor = statusDotBorder[event.status] || 'border-surface-container-high';
          const fillColor = statusDotFill[event.status] || 'bg-surface-container-high';
          return (
            <div key={index} className="relative pl-8 pb-lg last:pb-0">
              <div
                className={`absolute left-[5px] w-[14px] h-[14px] rounded-full border-2 ${borderColor} ${isLatest ? fillColor : 'bg-surface'} mt-0.5`}
              />
              <div>
                <p className="text-label-sm text-on-surface-variant">{formatDate(event.date)}</p>
                <p className="text-body-md text-on-surface mt-0.5">{event.event}</p>
                {event.notes && (
                  <p className="text-body-md text-on-surface-variant mt-1">{event.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
