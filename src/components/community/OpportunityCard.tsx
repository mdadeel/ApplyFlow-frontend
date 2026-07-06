import { MapPin, Briefcase, Clock } from '../../lib/icons'
import type { Opportunity } from '../../services/community/opportunities'

interface OpportunityCardProps {
  opportunity: Opportunity
  onClick?: () => void
}

export function OpportunityCard({ opportunity: opp, onClick }: OpportunityCardProps) {
  const deadline = opp.deadline ? new Date(opp.deadline) : null
  const isUrgent = deadline && deadline.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

  return (
    <div
      onClick={onClick}
      className="bg-surface border border-outline-variant rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-headline-sm text-on-surface font-semibold truncate">{opp.title}</h3>
          <p className="text-body-md text-on-surface-variant">{opp.company}</p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-label-xs font-medium ${
          opp.locationType === 'remote' ? 'bg-emerald-500/10 text-emerald-600' :
          opp.locationType === 'hybrid' ? 'bg-amber-500/10 text-amber-600' :
          'bg-blue-500/10 text-blue-600'
        }`}>
          {opp.locationType}
        </span>
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

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
        <div className="flex items-center gap-3">
          {opp.salaryMin && (
            <span className="text-label-sm text-on-surface-variant">
              ${opp.salaryMin.toLocaleString()}{opp.salaryMax ? ` - $${opp.salaryMax.toLocaleString()}` : ''}
            </span>
          )}
          <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
            <Briefcase className="w-3 h-3" />
            {opp.totalContributions}
          </span>
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
