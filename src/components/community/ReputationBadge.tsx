import { type ReputationLevel } from '../../services/community/reputation'
import { TrustBadge, type TrustBadgeTone } from './TrustBadge'

interface ReputationBadgeProps {
  level: ReputationLevel
  className?: string
}

const LEVEL_TONE_MAP: Record<ReputationLevel, { tone: TrustBadgeTone; label: string }> = {
  new: { tone: 'new', label: 'New' },
  active: { tone: 'verified', label: 'Active' },
  trusted: { tone: 'trusted', label: 'Trusted' },
  expert: { tone: 'top-contributor', label: 'Expert' },
}

/**
 * Thin wrapper around TrustBadge that maps a ReputationLevel to the
 * appropriate tone, label, and styling.
 */
export function ReputationBadge({ level, className }: ReputationBadgeProps) {
  const config = LEVEL_TONE_MAP[level] ?? LEVEL_TONE_MAP.new
  return (
    <TrustBadge
      tone={config.tone}
      label={config.label}
      className={className}
    />
  )
}
