import type { JDAnalysis } from '../../types';
import { Badge } from '../ui/Badge';
import { ProgressCircle } from '../ui/ProgressCircle';
import { MapPin, Briefcase, AlertTriangle } from '../../lib/icons';

interface JDSummaryProps {
  analysis: JDAnalysis;
}

export function JDSummary({ analysis }: JDSummaryProps) {
  const matchColor = (analysis.matchScore ?? 0) >= 80 ? 'success'
    : (analysis.matchScore ?? 0) >= 60 ? 'warning'
    : 'error';

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-md">
      <div className="flex flex-col lg:flex-row gap-lg">
        <div className="flex-1 space-y-md">
          <div>
            <h2 className="text-headline-md font-semibold text-on-surface">{analysis.role}</h2>
            <p className="text-body-md text-on-surface-variant mt-0.5">{analysis.company}</p>
          </div>

          {(analysis.location || analysis.experienceLevel) && (
            <div className="flex flex-wrap items-center gap-2">
              {analysis.location && (
                <div className="flex items-center gap-1 text-body-md text-on-surface-variant">
                  <MapPin className="h-4 w-4" />
                  {analysis.location}
                </div>
              )}
              {analysis.experienceLevel && (
                <div className="flex items-center gap-1 text-body-md text-on-surface-variant">
                  <Briefcase className="h-4 w-4" />
                  {analysis.experienceLevel}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-label-sm text-on-surface-variant mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.requiredSkills.map((skill) => (
                <Badge key={skill} variant="info" size="sm">{skill}</Badge>
              ))}
              {analysis.requiredSkills.length === 0 && (
                <span className="text-body-md text-on-surface-variant italic">None specified</span>
              )}
            </div>
          </div>

          {analysis.niceToHaveSkills.length > 0 && (
            <div>
              <p className="text-label-sm text-on-surface-variant mb-2">Nice-to-Have</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.niceToHaveSkills.map((skill) => (
                  <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.atsTerms.length > 0 && (
            <div>
              <p className="text-label-sm text-on-surface-variant mb-2">ATS Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.atsTerms.map((term) => (
                  <Badge key={term} variant="default" size="sm">{term}</Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.redFlags.length > 0 && (
            <div>
              <p className="text-label-sm text-red-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Red Flags
              </p>
              <ul className="space-y-1">
                {analysis.redFlags.map((flag) => (
                  <li key={flag} className="flex items-start gap-2 text-body-md text-red-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.summary && (
            <div>
              <p className="text-label-sm text-on-surface-variant mb-1">Summary</p>
              <p className="text-body-md text-on-surface">{analysis.summary}</p>
            </div>
          )}
        </div>

        {analysis.matchScore !== undefined && (
          <div className="flex flex-col items-center justify-center shrink-0">
            <ProgressCircle value={analysis.matchScore} color={matchColor} size={120} strokeWidth={8} />
            <p className="text-label-sm text-on-surface-variant mt-2">Match Score</p>
          </div>
        )}
      </div>
    </div>
  );
}
