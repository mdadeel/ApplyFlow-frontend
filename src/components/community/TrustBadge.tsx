import type { ReactNode } from 'react'
import type { LucideIcon } from '../../lib/icons'
import { CheckCircle, Shield, Star, Award, Handshake } from '../../lib/icons'

export type TrustBadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'primary'

export type TrustBadgeTone = 'verified' | 'trusted' | 'top-contributor' | 'referrer' | 'new' | 'custom'

const TONE_ICONS: Record<Exclude<TrustBadgeTone, 'custom'>, LucideIcon> = {
  verified: CheckCircle,
  trusted: Shield,
  'top-contributor': Star,
  referrer: Handshake,
  new: Award,
}

const TONE_LABELS: Record<Exclude<TrustBadgeTone, 'custom'>, string> = {
  verified: 'Verified',
  trusted: 'Trusted',
  'top-contributor': 'Top Contributor',
  referrer: 'Referrer',
  new: 'New',
}

const VARIANT_CLASSES: Record<TrustBadgeVariant, string> = {
  neutral: 'bg-surface-container-low text-on-surface-variant border-outline-variant',
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  danger: 'bg-red-500/10 text-red-600 border-red-500/30',
  primary: 'bg-primary/10 text-primary border-primary/30',
}

export interface TrustBadgeProps {
  tone?: TrustBadgeTone
  variant?: TrustBadgeVariant
  label?: string
  icon?: LucideIcon
  className?: string
  children?: ReactNode
}

export function TrustBadge({
  tone = 'verified',
  variant,
  label,
  icon,
  className = '',
  children,
}: TrustBadgeProps) {
  const ResolvedIcon = icon ?? (tone === 'custom' ? null : TONE_ICONS[tone])
  const resolvedLabel = label ?? (tone === 'custom' ? '' : TONE_LABELS[tone])
  const resolvedVariant: TrustBadgeVariant =
    variant ?? (tone === 'referrer' || tone === 'top-contributor' ? 'primary' : tone === 'trusted' ? 'info' : tone === 'new' ? 'warning' : tone === 'custom' ? 'neutral' : 'success')

  const finalLabel = children ?? resolvedLabel

  return (
    <span
      data-testid="trust-badge"
      data-tone={tone}
      data-variant={resolvedVariant}
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-medium border',
        VARIANT_CLASSES[resolvedVariant],
        className,
      ].join(' ')}
      title={typeof finalLabel === 'string' ? finalLabel : undefined}
    >
      {ResolvedIcon && (
        // @ts-expect-error - weight and aria-hidden are Phosphor properties not in LucideIcon
        <ResolvedIcon size={12} weight="fill" aria-hidden="true" />
      )}
      <span>{finalLabel}</span>
    </span>
  )
}

