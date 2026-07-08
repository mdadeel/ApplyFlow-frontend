import type { Application, ApplicationStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Dropdown } from '../ui/Dropdown';
import { Briefcase, MoreHorizontal, Eye, Trash2 } from '../../lib/icons';

interface ApplicationTableProps {
  applications: Application[];
  onRowClick?: (app: Application) => void;
  onStatusChange?: (id: string, status: ApplicationStatus) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ApplicationTable({
  applications,
  onRowClick,
  onStatusChange,
  onDelete,
  loading,
}: ApplicationTableProps) {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-secondary border-b border-border">
              {['Company', 'Role', 'Status', 'Match Score', 'Updated', 'Actions'].map((col) => (
                <th key={col} className="px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-border">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton variant="text" width="80%" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
        <EmptyState
          icon={<Briefcase className="h-8 w-8" />}
          title="No applications yet"
          description="Start by analyzing a job description to create your first application."
          noCard
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-card">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-secondary border-b border-border">
            <th className="px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary">Company</th>
            <th className="px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary">Role</th>
            <th className="px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary">Status</th>
            <th className="px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary">Match Score</th>
            <th className="px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary">Updated</th>
            <th className="px-6 py-3.5 text-left text-label-sm font-semibold text-text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const score = app.scores?.overall ?? app.scores?.match ?? 0;
            return (
              <tr
                key={app._id}
                className="border-t border-border hover:bg-surface-secondary/50 transition-all duration-200 cursor-pointer"
                onClick={() => onRowClick?.(app)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRowClick?.(app);
                }}
              >
                <td className="px-6 py-4 text-body-sm font-semibold text-text-primary">{app.company}</td>
                <td className="px-6 py-4 text-body-sm text-text-secondary">{app.role}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    align="left"
                    trigger={
                      <button
                        type="button"
                        className="focus:outline-none hover:opacity-80 transition-opacity flex items-center"
                        title="Click to change status"
                      >
                        <StatusBadge status={app.status} />
                      </button>
                    }
                    items={[
                      {
                        label: 'Preparation & AI Stages',
                        items: [
                          { label: 'Draft', onClick: () => onStatusChange?.(app._id, 'draft') },
                          { label: 'Analyzing', onClick: () => onStatusChange?.(app._id, 'analyzing') },
                          { label: 'Planning', onClick: () => onStatusChange?.(app._id, 'planning') },
                          { label: 'Generating', onClick: () => onStatusChange?.(app._id, 'generating') },
                          { label: 'Reviewing', onClick: () => onStatusChange?.(app._id, 'reviewing') },
                          { label: 'Ready', onClick: () => onStatusChange?.(app._id, 'ready') },
                          { label: 'Exported', onClick: () => onStatusChange?.(app._id, 'exported') },
                        ]
                      },
                      {
                        label: 'Applied Stage',
                        items: [
                          { label: 'Applied', onClick: () => onStatusChange?.(app._id, 'applied') },
                        ]
                      },
                      {
                        label: 'Interviewing Phase',
                        items: [
                          { label: 'Interview', onClick: () => onStatusChange?.(app._id, 'interview') },
                          { label: 'Assessment', onClick: () => onStatusChange?.(app._id, 'assessment') },
                        ]
                      },
                      {
                        label: 'Outcomes',
                        items: [
                          { label: 'Offer', onClick: () => onStatusChange?.(app._id, 'offer') },
                          { label: 'Rejected', onClick: () => onStatusChange?.(app._id, 'rejected') },
                          { label: 'Ghosted', onClick: () => onStatusChange?.(app._id, 'ghosted') },
                        ]
                      }
                    ]}
                  />
                </td>
                <td className="px-6 py-4 max-w-[160px]">
                  <ProgressBar
                    value={score}
                    size="sm"
                    color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
                    showLabel
                  />
                </td>
                <td className="px-6 py-4 text-body-sm text-text-secondary whitespace-nowrap">
                  {formatDate(app.updatedAt)}
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    align="right"
                    trigger={
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-surface-secondary text-text-tertiary transition-colors flex items-center justify-center"
                        aria-label={`Actions for ${app.company}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    }
                    items={[
                      {
                        label: 'View Details',
                        onClick: () => onRowClick?.(app),
                        icon: <Eye className="h-4 w-4" />,
                      },
                      {
                        label: 'Delete Application',
                        onClick: () => onDelete?.(app._id),
                        icon: <Trash2 className="h-4 w-4" />,
                        danger: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
