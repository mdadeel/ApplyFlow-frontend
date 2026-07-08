import type { CommunityEmptyStateProps } from './CommunityEmptyState'
import type { ReactNode } from 'react'
import {
  Bell,
  Bookmark,
  Briefcase,
  ChatCenteredDots,
  MessageCircle,
  Handshake,
  Newspaper,
  Search,
  Sparkles,
  Mail,
  TrendingUp,
  ArrowLeft,
  Users,
  User,
  FileText,
} from '../../lib/icons'

/**
 * Community empty-state copy map.
 *
 * Each entry returns an EmptyStateProps-compatible object (without the component wrapper).
 * Copy comes from `.kimchi/docs/community-empty-states-and-onboarding.md`.
 *
 * Icon substitutions vs the spec:
 *  - `SearchX` (lucide)   -> `Search`  (Phosphor equivalent; no SearchX export)
 *  - `Inbox`   (lucide)   -> `Tray`    (Phosphor equivalent; no Inbox export)
 *  - `Reply`   (lucide)   -> `ArrowUUpLeft` (Phosphor equivalent; no Reply export)
 *  - `MessageSquarePlus`  -> `ChatDots`     (closest Phosphor match)
 *  - `MessagesSquare`     -> `ChatCenteredDots` (closest Phosphor match)
 */

type EmptyStateConfig = Omit<CommunityEmptyStateProps, 'icon'> & { icon: CommunityEmptyStateProps['icon'] }

const feedExample = (
  <div className="opacity-60">
    <p className="text-label-sm text-on-surface-variant mb-2">
      Example feed items
    </p>
    <div className="space-y-2">
      <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
        <p className="text-label-xs text-on-surface-variant">
          New opportunity matching React, TypeScript
        </p>
        <p className="text-body-sm text-on-surface">Frontend Engineer at Acme</p>
      </div>
      <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
        <p className="text-label-xs text-on-surface-variant">
          Sarah offered a referral
        </p>
        <p className="text-body-sm text-on-surface">
          Open to referring product designers at Stripe
        </p>
      </div>
    </div>
  </div>
)

const contributionExample = (
  <div className="opacity-60">
    <p className="text-label-sm text-on-surface-variant mb-2">Example insight</p>
    <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
      <p className="text-label-xs text-on-surface-variant">Interview Insight</p>
      <p className="text-body-sm text-on-surface">
        “The technical screen is a 45-minute live coding exercise in React. Focus
        on state management and hooks.”
      </p>
    </div>
  </div>
)

const referralsExample = (
  <div className="opacity-60">
    <p className="text-label-sm text-on-surface-variant mb-2">
      Example referrals
    </p>
    <div className="space-y-2">
      <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
        <p className="text-label-xs text-on-surface-variant">Request</p>
        <p className="text-body-sm text-on-surface">
          Looking for a referral to Netflix for a Senior UX role.
        </p>
      </div>
      <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
        <p className="text-label-xs text-on-surface-variant">Offer</p>
        <p className="text-body-sm text-on-surface">
          I can refer engineers to my team at Shopify.
        </p>
      </div>
    </div>
  </div>
)

const trendingExample = (
  <div className="opacity-60">
    <p className="text-label-sm text-on-surface-variant mb-2">
      Preview — based on simulated data
    </p>
    <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
      <p className="text-label-xs text-on-surface-variant">Top skill</p>
      <p className="text-body-sm text-on-surface">TypeScript · 24 mentions</p>
    </div>
  </div>
)

const noResultsExample = (
  <div className="opacity-60">
    <p className="text-label-sm text-on-surface-variant mb-2">
      Almost-matched opportunities
    </p>
    <div className="space-y-2">
      <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
        <p className="text-body-sm text-on-surface">Frontend Engineer — Remote (EU)</p>
      </div>
      <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
        <p className="text-body-sm text-on-surface">Frontend Engineer — Hybrid (London)</p>
      </div>
    </div>
  </div>
)

const workspacePreviewExample = (contentType: string) => (
  <div className="opacity-60">
    <p className="text-label-sm text-on-surface-variant mb-2">
      Preview of what we’ll generate.
    </p>
    <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-low">
      <p className="text-label-xs text-on-surface-variant mb-1">{contentType}</p>
      <p className="text-body-sm text-on-surface">
        A tailored {contentType.toLowerCase()} based on your Career Profile and
        this role.
      </p>
    </div>
  </div>
)

export const communityEmptyStates = {
  feedNoActivity: {
    icon: Newspaper,
    title: 'Your feed is quiet right now',
    description:
      'When opportunities, referrals, or discussions match your career profile, they’ll show up here. Start by browsing roles or telling the community what you’re looking for.',
    primaryAction: { label: 'Browse opportunities', href: '/community/opportunities' },
    secondaryAction: { label: 'Request a referral', href: '/community/referrals/request' },
    example: feedExample,
  } satisfies EmptyStateConfig,

  trendingEmpty: {
    icon: TrendingUp,
    title: 'Trending data is still growing',
    description:
      'As more members post opportunities and share insights, we’ll surface the companies, skills, and salary bands that matter most for your role.',
    primaryAction: { label: 'Add an opportunity', href: '/community/opportunities/new' },
    secondaryAction: { label: 'See what’s being discussed', href: '/community/discussions' },
    example: trendingExample,
  } satisfies EmptyStateConfig,

  myActivityEmpty: {
    icon: User,
    title: 'No activity yet',
    description:
      'Your saved roles, applications, contributions, and referrals will appear here. Everything you do in Community helps you track your job search in one place.',
    primaryAction: { label: 'Find your first opportunity', href: '/community/opportunities' },
    secondaryAction: { label: 'Start a discussion', href: '/community/discussions/new' },
  } satisfies EmptyStateConfig,

  opportunitiesNoResults: {
    icon: Search,
    title: 'No opportunities match your filters',
    description:
      'Try removing a filter, broadening your search, or saving this search so we can alert you when matching roles are posted.',
    primaryAction: { label: 'Clear filters', onClick: () => undefined },
    secondaryAction: { label: 'Save this search', onClick: () => undefined },
    example: noResultsExample,
  } satisfies EmptyStateConfig,

  opportunitiesGlobalEmpty: {
    icon: Briefcase,
    title: 'No opportunities yet',
    description:
      'Be the first to share a role. Paste a job URL, upload a posting, or add one manually. The community grows when members share what they find.',
    primaryAction: { label: 'Add an opportunity', href: '/community/opportunities/new' },
    secondaryAction: { label: 'See discussions', href: '/community/discussions' },
  } satisfies EmptyStateConfig,

  savedEmpty: {
    icon: Bookmark,
    title: 'You haven’t saved any opportunities',
    description:
      'Save roles you’re interested in and we’ll alert you to new contributions, referral offers, and deadline reminders.',
    primaryAction: { label: 'Browse opportunities', href: '/community/opportunities' },
    secondaryAction: { label: 'Set up alerts', href: '/settings/notifications' },
  } satisfies EmptyStateConfig,

  opportunityNoContributions: {
    icon: MessageCircle,
    title: 'No community insights yet',
    description:
      'Be the first to share something useful: a salary update, interview tip, culture note, or referral offer. Your input helps everyone make better decisions.',
    primaryAction: { label: 'Add insight', onClick: () => undefined },
    secondaryAction: { label: 'How contributions work', onClick: () => undefined },
    example: contributionExample,
  } satisfies EmptyStateConfig,

  opportunityNoReferrals: {
    icon: Users,
    title: 'No open referrals for this role',
    description:
      'Ask the community for a referral or check the global referrals board to see who can help at this company.',
    primaryAction: {
      label: 'Request referral',
      href: '/community/referrals/request',
    },
    secondaryAction: { label: 'Browse all referrals', href: '/community/referrals' },
  } satisfies EmptyStateConfig,

  discussionsChannelEmpty: (channelName: string) =>
    ({
      icon: ChatCenteredDots,
      title: `No discussions in ${channelName} yet`,
      description:
        'Start the first conversation. Whether you’re asking for feedback, sharing an experience, or offering advice, your post helps build the community.',
      primaryAction: {
        label: 'Start a discussion',
        href: '/community/discussions/new',
      },
      secondaryAction: { label: 'See other channels', href: '/community/discussions' },
    } satisfies EmptyStateConfig),

  discussionNoReplies: {
    icon: ArrowLeft,
    title: 'No replies yet',
    description:
      'Be the first to respond. Keep feedback constructive and specific.',
    primaryAction: { label: 'Reply', onClick: () => undefined },
  } satisfies EmptyStateConfig,

  referralsNoOpen: {
    icon: Handshake,
    title: 'No open referrals',
    description:
      'Referrals are one of the best ways to get hired. Request one for a company you’re targeting, or offer one if you can help someone else.',
    primaryAction: {
      label: 'Request a referral',
      href: '/community/referrals/request',
    },
    secondaryAction: { label: 'Offer a referral', href: '/community/referrals/offer' },
    example: referralsExample,
  } satisfies EmptyStateConfig,

  referralsMyEmpty: {
    icon: Mail,
    title: 'You haven’t made or requested any referrals',
    description:
      'Track your referral requests and offers here. We’ll notify you when someone accepts or responds.',
    primaryAction: {
      label: 'Request a referral',
      href: '/community/referrals/request',
    },
    secondaryAction: { label: 'Offer a referral', href: '/community/referrals/offer' },
  } satisfies EmptyStateConfig,

  notificationsEmpty: {
    icon: Bell,
    title: 'All caught up',
    description:
      'We’ll notify you about referrals, comments on your posts, deadline reminders, and opportunities that match your profile.',
    primaryAction: { label: 'Browse opportunities', href: '/community/opportunities' },
    secondaryAction: { label: 'Manage notification settings', href: '/settings/notifications' },
  } satisfies EmptyStateConfig,

  workspaceNoContent: (contentType: string) =>
    ({
      icon: Sparkles,
      title: `No ${contentType} generated yet`,
      description: `Click generate to create a tailored ${contentType.toLowerCase()} for this role based on your Career Profile and the job description.`,
      primaryAction: {
        label: `Generate ${contentType.toLowerCase()}`,
        onClick: () => undefined,
      },
      example: workspacePreviewExample(contentType),
    } satisfies EmptyStateConfig),

  profilesNoResults: {
    icon: Search,
    title: 'No results found',
    description: 'We couldn’t find any profiles or templates matching your criteria. Try adjusting your filters or search terms.',
  } satisfies EmptyStateConfig,

  templates: {
    icon: FileText,
    title: 'No templates available',
    description: 'Explore community templates for resumes, cover letters, and emails or contribute your own.',
    primaryAction: { label: 'Create a template', href: '/community/templates/create' },
  } satisfies EmptyStateConfig,
} as const

export type CommunityEmptyStateKey = keyof typeof communityEmptyStates

// Re-export so consumers don't need a second import for the ReactNode type.
export type { ReactNode }

