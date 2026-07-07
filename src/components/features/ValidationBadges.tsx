import { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Sparkles } from '../../lib/icons'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { SmartApplicationScores, ValidationHintsOutput } from '../../services/smartApplication'

interface ValidationBadgesProps {
  scores: SmartApplicationScores
  hints: ValidationHintsOutput
  atsKeywords: string[]
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: 'emerald' | 'amber' | 'rose' | 'blue' }) {
  const circumference = 2 * Math.PI * 18
  const offset = circumference - (value / 100) * circumference
  const colorClass = {
    emerald: 'text-emerald-500 stroke-emerald-500',
    amber: 'text-amber-500 stroke-amber-500',
    rose: 'text-rose-500 stroke-rose-500',
    blue: 'text-blue-500 stroke-blue-500',
  }[color]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-12 w-12">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" className="fill-none stroke-surface-tertiary" strokeWidth="4" />
          <circle
            cx="20"
            cy="20"
            r="18"
            className={`fill-none ${colorClass}`}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-caption font-bold text-text-primary">
          {value}
        </span>
      </div>
      <span className="text-caption text-text-tertiary">{label}</span>
    </div>
  )
}

function getScoreColor(value: number): 'emerald' | 'amber' | 'rose' {
  if (value >= 80) return 'emerald'
  if (value >= 60) return 'amber'
  return 'rose'
}

export function ValidationBadges({ scores, hints, atsKeywords }: ValidationBadgesProps) {
  const [expanded, setExpanded] = useState(false)
  const matchColor = getScoreColor(scores.match)
  const atsColor = getScoreColor(scores.ats)
  const overallColor = getScoreColor(scores.overall)

  const truthPassed = hints.truthFlags.length === 0
  const humanizationIssues = hints.humanizationTips.length

  return (
    <Card className="p-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-heading-3 text-text-primary">Validation</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-body-sm text-primary hover:text-primary/80 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? 'Less' : 'Details'}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-around">
        <ScoreRing value={scores.overall} label="Overall" color={overallColor === 'rose' ? 'blue' : overallColor} />
        <ScoreRing value={scores.match} label="Match" color={matchColor} />
        <ScoreRing value={scores.ats} label="ATS" color={atsColor} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          variant={truthPassed ? 'success' : 'warning'}
          className="flex items-center gap-1"
        >
          {truthPassed ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          Truth {truthPassed ? 'Passed' : `${hints.truthFlags.length} issue${hints.truthFlags.length > 1 ? 's' : ''}`}
        </Badge>
        <Badge
          variant={humanizationIssues === 0 ? 'success' : humanizationIssues <= 2 ? 'warning' : 'danger'}
          className="flex items-center gap-1"
        >
          {humanizationIssues === 0 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          Humanization {humanizationIssues === 0 ? 'Good' : `${humanizationIssues} tip${humanizationIssues > 1 ? 's' : ''}`}
        </Badge>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {atsKeywords.length > 0 && (
            <div>
              <h4 className="text-body font-medium text-text-primary mb-2">ATS Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {atsKeywords.map((keyword) => (
                  <Badge key={keyword} variant="default">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hints.atsKeywordsToInclude.length > 0 && (
            <div>
              <h4 className="text-body font-medium text-text-primary mb-2">Keywords to Include</h4>
              <div className="flex flex-wrap gap-1.5">
                {hints.atsKeywordsToInclude.map((keyword) => (
                  <Badge key={keyword} variant="warning">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hints.truthFlags.length > 0 && (
            <div>
              <h4 className="text-body font-medium text-text-primary mb-2">Truth Checks</h4>
              <ul className="space-y-1.5">
                {hints.truthFlags.map((flag, index) => (
                  <li key={index} className="flex items-start gap-2 text-body-sm text-text-secondary">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hints.humanizationTips.length > 0 && (
            <div>
              <h4 className="text-body font-medium text-text-primary mb-2">Humanization Tips</h4>
              <ul className="space-y-1.5">
                {hints.humanizationTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-body-sm text-text-secondary">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
