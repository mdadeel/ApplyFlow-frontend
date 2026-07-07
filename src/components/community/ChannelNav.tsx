import { NavLink } from 'react-router-dom'
import {
  DISCUSSION_CHANNELS,
  DISCUSSION_CHANNEL_LABELS,
  type DiscussionChannel,
} from '../../services/community/discussions'

interface ChannelNavProps {
  /**
   * Currently active channel. When undefined, the "All" entry is highlighted.
   */
  activeChannel?: DiscussionChannel
}

export interface ChannelEntry {
  id: DiscussionChannel | 'all'
  label: string
}

const ALL_ENTRY: ChannelEntry = { id: 'all', label: 'All discussions' }

/**
 * Sidebar / tab navigation that lets users filter discussions by channel.
 *
 * Renders as a vertical list by default and is responsive (collapses to a
 * horizontal scroll on small screens via the parent layout's overflow rules).
 */
export function ChannelNav({ activeChannel }: ChannelNavProps) {
  const entries: ChannelEntry[] = [
    ALL_ENTRY,
    ...DISCUSSION_CHANNELS.map((channel) => ({
      id: channel,
      label: DISCUSSION_CHANNEL_LABELS[channel],
    })),
  ]

  return (
    <nav
      aria-label="Discussion channels"
      data-testid="channel-nav"
      className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible"
    >
      {entries.map((entry) => {
        const target =
          entry.id === 'all'
            ? '/community/discussions'
            : `/community/discussions/${entry.id}`
        const isActive =
          entry.id === 'all'
            ? activeChannel === undefined
            : activeChannel === entry.id
        return (
          <NavLink
            key={entry.id}
            to={target}
            end={entry.id === 'all'}
            data-testid={`channel-nav-${entry.id}`}
            className={({ isActive: navActive }) => {
              const active = navActive || isActive
              return [
                'flex items-center whitespace-nowrap px-3 py-2 rounded-lg text-label-md transition-colors',
                active
                  ? 'bg-primary-container text-on-primary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              ].join(' ')
            }}
          >
            {entry.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
