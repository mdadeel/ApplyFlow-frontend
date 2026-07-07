import { MapPin, Briefcase, Clock, Sparkles, Users } from '../../lib/icons'
import type { Opportunity } from '../../services/community/opportunities'
import { SaveOpportunityButton } from './SaveOpportunityButton'

interface OpportunityCardProps {
  opportunity: Opportunity
  onClick?: () => void
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function OpportunityCard({ opportunity: opp, onClick }: OpportunityCardProps) {
  const deadline = opp.deadline ? new Date(opp.deadline) : null
  const isUrgent = deadline && deadline.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

  const postedAt = opp.createdAt ? new Date(opp.createdAt) : null
  const isNew = postedAt && Date.now() - postedAt.getTime() < SEVEN_DAYS_MS

  // Match score is currently a placeholder (averageMatchScore). Render as a percentage.
  const matchScore = typeof opp.averageMatchScore === 'number'
    ? Math.round(opp.averageMatchScore * 100)
    : null

  return (
    <div
      onClick={onClick}
      className="bg-surface border border-outline-variant rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-headline-sm text-on-surface font-semibold truncate">{opp.title}</h3>
            {isNew && (
              <span
                data-testid="opportunity-new-badge"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-label-xs font-medium"
              >
                <Sparkles className="w-3 h-3" />
                New
              </span>
            )}
            {matchScore !== null && (
              <span
                data-testid="opportunity-match-badge"
                className={`px-1.5 py-0.5 rounded-full text-label-xs font-medium ${
                  matchScore >= 75
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : matchScore >= 50
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-surface-container-low text-on-surface-variant border border-outline-variant'
                }`}
              >
                {matchScore}% match
              </span>
            )}
          </div>
          <p className="text-body-md text-on-surface-variant">{opp.company}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-label-xs font-medium ${
            opp.locationType === 'remote' ? 'bg-emerald-500/10 text-emerald-600' :
            opp.locationType === 'hybrid' ? 'bg-amber-500/10 text-amber-600' :
            'bg-blue-500/10 text-blue-600'
          }`}>
            {opp.locationType}
          </span>
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <SaveOpportunityButton opportunityId={opp._id} size="sm" />
          </div>
        </div>
      </div>

      {opp.location && (
        <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant mb-2">
          <MapPin className="w-3.5 h-3.5" />
          {opp.location}
        </div>
      )}

      {opp.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {opp.requiredSkills.slice(0, 4).map(s => (
            <span key={s} className="px-2 py-0.5 bg-surface-container-low rounded text-label-xs text-on-surface-variant border border-outline-variant">
              {s}
            </span>
          ))}
          {opp.requiredSkills.length > 4 && (
            <span className="text-label-xs text-on-surface-variant">+{opp.requiredSkills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant gap-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {opp.salaryMin && (
            <span className="text-label-sm text-on-surface-variant">
              ${opp.salaryMin.toLocaleString()}{opp.salaryMax ? ` - $${opp.salaryMax.toLocaleString()}` : ''}
            </span>
          )}
          <span
            className="flex items-center gap-1 text-label-sm text-on-surface-variant"
            data-testid="opportunity-contributor-count"
            aria-label={`${opp.totalContributions} contributors`}
          >
            <Briefcase className="w-3 h-3" />
            {opp.totalContributions}
          </span>
          {opp.referralAvailable && (
            <span
              data-testid="opportunity-referral-indicator"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-xs font-medium"
              aria-label="Referrals available"
            >
              <Users className="w-3 h-3" />
              {opp.referralCount && opp.referralCount > 0
                ? `${opp.referralCount} referral${opp.referralCount === 1 ? '' : 's'}`
                : 'Referrals available'}
            </span>
          )}
        </div>
        {deadline && (
          <span className={`flex items-center gap-1 text-label-xs ${isUrgent ? 'text-red-500' : 'text-on-surface-variant'}`}>
            <Clock className="w-3 h-3" />
            {isUrgent ? 'Soon' : deadline.toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
