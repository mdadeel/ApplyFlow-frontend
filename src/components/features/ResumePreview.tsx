import type { ResumeContent } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface ResumePreviewProps {
  content: ResumeContent;
  loading?: boolean;
}

function SkeletonBlock() {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" width="60%" height={20} />
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="75%" />
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton variant="text" width="40%" height={18} />
        <Skeleton variant="text" width="30%" height={14} />
        <div className="space-y-1.5 pl-4">
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>
    </div>
  );
}

export function ResumePreview({ content, loading }: ResumePreviewProps) {
  if (loading) {
    return (
      <div className="bg-white border border-outline-variant rounded-xl p-lg">
        <SkeletonBlock />
      </div>
    );
  }

  if (!content.summary && content.experiences.length === 0) {
    return (
      <div className="bg-white border border-outline-variant rounded-xl p-lg text-center">
        <p className="text-body-md text-on-surface-variant">No resume content generated yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-outline-variant rounded-xl p-lg max-w-[800px] mx-auto">
      <div className="space-y-md">
        {content.summary && (
          <div>
            <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Professional Summary</h3>
            <p className="text-body-md text-on-surface leading-relaxed">{content.summary}</p>
          </div>
        )}

        {content.experiences.length > 0 && (
          <div>
            <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3 border-b border-outline-variant pb-1">
              Experience
            </h3>
            <div className="space-y-4">
              {content.experiences.map((exp, i) => {
                const expData = exp as Record<string, unknown>;
                return (
                  <div key={i}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">
                          {String(expData.role ?? '')}
                        </p>
                        <p className="text-body-md text-on-surface-variant">
                          {String(expData.company ?? '')}
                        </p>
                      </div>
                      <p className="text-label-sm text-on-surface-variant whitespace-nowrap">
                        {String(expData.startDate ?? '')}
                        {expData.endDate ? ` - ${String(expData.endDate)}` : expData.current ? ' - Present' : ''}
                      </p>
                    </div>
                    {Array.isArray(expData.responsibilities) && (
                      <ul className="mt-2 space-y-1">
                        {expData.responsibilities.map((r: unknown, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-body-md text-on-surface">
                            <span className="mt-2 w-1 h-1 rounded-full bg-on-surface-variant shrink-0" />
                            {String(r)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {content.projects.length > 0 && (
          <div>
            <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3 border-b border-outline-variant pb-1">
              Projects
            </h3>
            <div className="space-y-3">
              {content.projects.map((proj, i) => {
                const projData = proj as Record<string, unknown>;
                return (
                  <div key={i}>
                    <p className="text-body-md font-semibold text-on-surface">
                      {String(projData.title ?? '')}
                    </p>
                    <p className="text-body-md text-on-surface mt-0.5">
                      {String(projData.description ?? '')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {content.skills.length > 0 && (
          <div>
            <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 border-b border-outline-variant pb-1">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {content.skills.map((skill) => (
                <span key={skill} className="text-body-md text-on-surface bg-surface-container-low px-2 py-0.5 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
