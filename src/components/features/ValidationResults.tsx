import type { ValidationReport } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { AlertTriangle, XCircle, CheckCircle } from '../../lib/icons';

interface ValidationResultsProps {
  report?: ValidationReport;
  loading?: boolean;
}

export function ValidationResults({ report, loading }: ValidationResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" width="100%" height={60} />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="100%" height={8} />
              <Skeleton variant="text" width="60%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-xl text-center">
        <p className="text-body-md text-on-surface-variant">No validation results yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {report.blocked && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-body-md font-semibold text-red-700">Validation Blocked</p>
            <p className="text-body-md text-red-600 mt-0.5">
              Critical issues found. Resolve all errors before proceeding.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {report.results.map((result) => (
          <div
            key={result.name}
            className="bg-surface border border-outline-variant rounded-xl p-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-body-md font-medium text-on-surface">{result.name}</p>
                {result.passed ? (
                  <Badge variant="success">Passed</Badge>
                ) : (
                  <Badge variant="danger">Failed</Badge>
                )}
              </div>
              <span className="text-label-sm text-on-surface-variant">{Math.round(result.score)}%</span>
            </div>

            <ProgressBar
              value={result.score}
              size="md"
              color={result.passed ? 'success' : 'error'}
            />

            {result.issues.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {issue.severity === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <span className="text-body-md text-on-surface">{issue.message}</span>
                  </div>
                ))}
              </div>
            )}

            {result.issues.length === 0 && result.passed && (
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-body-md text-emerald-600">All checks passed</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
