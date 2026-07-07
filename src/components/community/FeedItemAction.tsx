import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookmarkSimple, Eye, Handshake, MessageCircle } from '../../lib/icons'

export type FeedItemActionVariant = 'primary' | 'secondary'

interface BaseProps {
  variant?: FeedItemActionVariant
}

interface LinkActionProps extends BaseProps {
  kind: 'link'
  label: string
  href: string
  icon?: ReactNode
}

interface ButtonActionProps extends BaseProps {
  kind: 'button'
  label: string
  onClick: () => void
  icon?: ReactNode
  ariaLabel?: string
}

export type FeedItemActionProps = LinkActionProps | ButtonActionProps

const baseClass =
  'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full font-label-sm transition-colors duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed'

const variantClass: Record<FeedItemActionVariant, string> = {
  primary: 'bg-primary-container text-on-primary hover:bg-primary',
  secondary: 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low',
}

/**
 * Small action button(s) attached to a feed item.
 *
 * Renders as a Link when given `kind: 'link'`, otherwise as a `<button>`.
 */
export function FeedItemAction(props: FeedItemActionProps) {
  const { variant = 'secondary', icon, label } = props
  const className = `${baseClass} ${variantClass[variant]}`

  if (props.kind === 'link') {
    return (
      <Link to={props.href} className={className}>
        {icon ?? <ArrowRight size={14} aria-hidden="true" />}
        {label}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={props.ariaLabel ?? label}
      className={className}
    >
      {icon ?? <ArrowRight size={14} aria-hidden="true" />}
      {label}
    </button>
  )
}

/**
 * Convenience helpers for the standard contextual action set.
 * Keep these in sync with the spec's "Item actions" rules.
 */
export function ViewOpportunityAction({ opportunityId }: { opportunityId: string }) {
  return (
    <FeedItemAction
      kind="link"
      variant="secondary"
      label="View"
      icon={<Eye size={14} aria-hidden="true" />}
      href={`/community/opportunities/${opportunityId}`}
    />
  )
}

export function SaveOpportunityAction({
  onClick,
}: {
  opportunityId: string
  onClick: () => void
}) {
  return (
    <FeedItemAction
      kind="button"
      variant="primary"
      label="Save"
      icon={<BookmarkSimple size={14} aria-hidden="true" />}
      onClick={onClick}
      ariaLabel="Save opportunity"
    />
  )
}

export function JoinDiscussionAction({ href }: { href: string }) {
  return (
    <FeedItemAction
      kind="link"
      variant="primary"
      label="Join"
      icon={<MessageCircle size={14} aria-hidden="true" />}
      href={href}
    />
  )
}

export function HelpReferralAction({ href }: { href: string }) {
  return (
    <FeedItemAction
      kind="link"
      variant="primary"
      label="Help"
      icon={<Handshake size={14} aria-hidden="true" />}
      href={href}
    />
  )
}

export function AcceptReferralAction({ href }: { href: string }) {
  return (
    <FeedItemAction
      kind="link"
      variant="primary"
      label="Accept"
      icon={<Handshake size={14} aria-hidden="true" />}
      href={href}
    />
  )
}

export function ReplyDiscussionAction({ href }: { href: string }) {
  return (
    <FeedItemAction
      kind="link"
      variant="primary"
      label="Reply"
      icon={<MessageCircle size={14} aria-hidden="true" />}
      href={href}
    />
  )
}
