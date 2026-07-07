import type { InterviewPrep } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Lightbulb, Target, Building2, AlertTriangle, RefreshCw } from '../../lib/icons';

interface InterviewPrepCardProps {
  prep: InterviewPrep;
  loading?: boolean;
  onRefreshResearch?: () => void;
  researchLoading?: boolean;
}

const questionTypeVariant: Record<string, 'default' | 'warning'> = {
  technical: 'default',
  behavioral: 'warning',
  situational: 'default',
};

function getTypeVariant(type: string): 'default' | 'warning' {
  return questionTypeVariant[type.toLowerCase()] || 'default';
}

export function InterviewPrepCard({ prep, loading, onRefreshResearch, researchLoading }: InterviewPrepCardProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" width="100%" height={120} />
        <Skeleton variant="rectangular" width="100%" height={80} />
        <Skeleton variant="rectangular" width="100%" height={60} />
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {prep.questions.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl p-md">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-body-md font-semibold text-on-surface">Practice Questions</h3>
          </div>
          <div className="space-y-3">
            {prep.questions.map((q, i) => (
              <div key={i} className="pb-3 border-b border-outline-variant last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body-md text-on-surface flex-1">{q.question}</p>
                  <Badge variant={getTypeVariant(q.type)} className="shrink-0 capitalize">
                    {q.type}
                  </Badge>
                </div>
                {q.answer && (
                  <p className="text-body-md text-on-surface-variant mt-1">{q.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {prep.talkingPoints.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl p-md">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-emerald-500" />
            <h3 className="text-body-md font-semibold text-on-surface">Key Talking Points</h3>
          </div>
          <ul className="space-y-1.5">
            {prep.talkingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-body-md text-on-surface">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {prep.weakAreas.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl p-md">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-body-md font-semibold text-on-surface">Areas to Improve</h3>
          </div>
          <ul className="space-y-1.5">
            {prep.weakAreas.map((area, i) => (
              <li key={i} className="flex items-start gap-2 text-body-md text-on-surface">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {prep.companyResearch && (
        <div className="bg-surface border border-outline-variant rounded-xl p-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <h3 className="text-body-md font-semibold text-on-surface">Company Research</h3>
            </div>
            {onRefreshResearch && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRefreshResearch}
                loading={researchLoading}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh Company Research
              </Button>
            )}
          </div>
          <p className="text-body-md text-on-surface whitespace-pre-line">{prep.companyResearch}</p>
        </div>
      )}

      {prep.questions.length === 0 && !prep.companyResearch && (
        <div className="py-xl text-center">
          <p className="text-body-md text-on-surface-variant">No interview prep data available yet.</p>
        </div>
      )}
    </div>
  );
}
