import type { Application } from '../../types';
import { ListChecks } from '../../lib/icons';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface ApplicationCardProps {
  application: Application;
  onClick?: () => void;
  pendingTaskCount?: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ApplicationCard({ application: app, onClick, pendingTaskCount }: ApplicationCardProps) {
  const score = app.scores?.overall ?? app.scores?.match ?? 0;

  return (
    <Card onClick={onClick} hover className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-heading-3 text-text-primary truncate">{app.company}</p>
          <p className="text-body-sm text-text-secondary truncate">{app.role}</p>
        </div>
        <StatusBadge status={app.status} className="shrink-0" />
      </div>

      {app.scores && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-meta text-text-tertiary mb-1">Match Score</p>
            <ProgressBar value={score} size="sm" color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'} />
          </div>
          <span className="text-meta font-medium text-text-primary shrink-0">{score}%</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-meta text-text-tertiary whitespace-nowrap">{formatDate(app.updatedAt)}</span>
        <div className="flex items-center gap-2">
          {typeof pendingTaskCount === 'number' && pendingTaskCount > 0 && (
            <span
                className="inline-flex items-center gap-1 text-meta text-text-tertiary"
              data-testid="pending-task-count"
            >
              <ListChecks className="h-3.5 w-3.5" />
              {pendingTaskCount} pending
            </span>
          )}
          {app.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {app.tags.slice(0, 3).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
              {app.tags.length > 3 && (
                <span className="text-meta text-text-tertiary">+{app.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
