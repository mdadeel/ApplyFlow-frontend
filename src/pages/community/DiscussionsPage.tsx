import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { ChannelNav } from '../../components/community/ChannelNav'
import { DiscussionCard } from '../../components/community/DiscussionCard'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { communityEmptyStates } from '../../components/community/communityEmptyStates'
import { Plus, Loader2, AlertTriangle } from '../../lib/icons'
import {
  DISCUSSION_CHANNELS,
  DISCUSSION_CHANNEL_LABELS,
  listDiscussions,
  type Discussion,
  type DiscussionChannel,
} from '../../services/community/discussions'

function isDiscussionChannel(value: string | undefined): value is DiscussionChannel {
  return (
    typeof value === 'string' &&
    (DISCUSSION_CHANNELS as string[]).includes(value)
  )
}

export function DiscussionsPage() {
  const { channel: channelParam } = useParams<{ channel?: string }>()
  const channel = isDiscussionChannel(channelParam) ? channelParam : undefined

  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listDiscussions({ channel })
      .then((items) => {
        if (cancelled) return
        setDiscussions(items)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Failed to load discussions.'
        setError(message)
        setDiscussions([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [channel])

  const channelLabel = channel
    ? DISCUSSION_CHANNEL_LABELS[channel]
    : 'All discussions'

  const newDiscussionHref = channel
    ? `/community/discussions/new?channel=${channel}`
    : '/community/discussions/new'

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-xl gap-3 flex-wrap">
          <div>
            <h1 className="text-headline-lg text-on-surface font-semibold">
              {channelLabel}
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Conversations, tips, and insights from the community
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              window.location.assign(newDiscussionHref)
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Start a discussion
          </Button>
        </div>

        <div className="grid gap-lg md:grid-cols-[220px_1fr]">
          <aside className="md:sticky md:top-4 md:self-start">
            <ChannelNav activeChannel={channel} />
          </aside>

          <section aria-label="Discussion list" data-testid="discussions-list">
            {loading ? (
              <div
                className="flex items-center justify-center py-20"
                data-testid="discussions-loading"
              >
                <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
              </div>
            ) : error ? (
              <div
                className="flex flex-col items-center justify-center text-center py-xl px-md"
                data-testid="discussions-error"
              >
                <AlertTriangle
                  className="w-10 h-10 text-error mb-3"
                  aria-hidden="true"
                />
                <h3 className="text-headline-md text-on-surface mb-1">
                  Couldn’t load discussions
                </h3>
                <p className="text-body-md text-on-surface-variant mb-4">
                  {error}
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : discussions.length === 0 ? (
              <CommunityEmptyState {...communityEmptyStates.discussionsChannelEmpty(channelLabel)} />
            ) : (
              <ul className="space-y-3" data-testid="discussions-results">
                {discussions.map((discussion) => (
                  <li key={discussion._id}>
                    <DiscussionCard discussion={discussion} includeChannelInHref />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
