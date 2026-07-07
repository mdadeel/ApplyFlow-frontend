import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ThreadReplyForm } from '../../components/community/ThreadReplyForm'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { useToast } from '../../components/layout/useToast'
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Pin,
  Loader2,
  AlertTriangle,
} from '../../lib/icons'
import {
  createReply,
  getDiscussion,
  DISCUSSION_CHANNEL_LABELS,
  type Discussion,
  type DiscussionReply,
} from '../../services/community/discussions'
import { ApiError } from '../../services/api'

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function DiscussionThreadPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<DiscussionReply[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!id) {
      setLoading(false)
      setLoadError('Missing discussion id.')
      return
    }
    setLoading(true)
    setLoadError(null)
    getDiscussion(id)
      .then((response) => {
        if (cancelled) return
        setDiscussion(response.discussion)
        setReplies(response.replies)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'We couldn’t load this discussion. Please try again.'
        setLoadError(message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleReply = useCallback(
    async (body: string) => {
      if (!id) return
      setSubmittingReply(true)
      try {
        const reply = await createReply(id, { body })
        setReplies((prev) => [...prev, reply])
        setDiscussion((prev) =>
          prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev,
        )
        showToast('Reply posted', 'success')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to post reply.'
        showToast(message, 'error')
        throw err
      } finally {
        setSubmittingReply(false)
      }
    },
    [id, showToast],
  )

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/community/discussions')}
          className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to discussions
        </button>

        {loading ? (
          <div
            className="flex items-center justify-center py-20"
            data-testid="discussion-loading"
          >
            <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
          </div>
        ) : loadError ? (
          <Card>
            <div className="py-12 text-center">
              <AlertTriangle
                className="w-10 h-10 text-error mx-auto mb-3"
                aria-hidden="true"
              />
              <h3 className="text-headline-md text-on-surface mb-1">
                Couldn’t load this discussion
              </h3>
              <p className="text-body-md text-on-surface-variant mb-4">
                {loadError}
              </p>
              <Button variant="primary" onClick={() => navigate('/community/discussions')}>
                Back to discussions
              </Button>
            </div>
          </Card>
        ) : !discussion ? (
          <Card>
            <div className="py-20 text-center">
              <MessageSquare className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-50" />
              <h3 className="text-headline-md text-on-surface mb-1">
                Discussion not found
              </h3>
              <p className="text-body-md text-on-surface-variant mb-4">
                This discussion may have been removed or is unavailable.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/community/discussions')}
              >
                Browse discussions
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <Card className="mb-lg">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Link
                  to={`/community/discussions/${discussion.channel}`}
                  className="px-2 py-0.5 rounded-full bg-surface-container text-label-xs text-on-surface-variant hover:bg-primary-container hover:text-on-primary transition-colors"
                >
                  {DISCUSSION_CHANNEL_LABELS[discussion.channel] ?? 'General'}
                </Link>
                {discussion.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-xs">
                    <Pin className="w-3 h-3" aria-hidden="true" />
                    Pinned
                  </span>
                )}
                <span className="text-label-xs text-on-surface-variant ml-auto">
                  {formatDate(discussion.createdAt)}
                </span>
              </div>
              <h1
                data-testid="discussion-thread-title"
                className="text-headline-lg text-on-surface font-semibold mb-2"
              >
                {discussion.title}
              </h1>
              {discussion.authorName && (
                <p className="text-label-sm text-on-surface-variant mb-3">
                  Posted by {discussion.authorName}
                </p>
              )}
              <p className="text-body-md text-on-surface whitespace-pre-wrap">
                {discussion.body}
              </p>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant text-label-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  {discussion.replyCount} {discussion.replyCount === 1 ? 'reply' : 'replies'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                  {discussion.helpfulCount} helpful
                </span>
              </div>
            </Card>

            <section aria-label="Replies" className="mb-lg">
              <h2 className="text-headline-sm text-on-surface font-semibold mb-3">
                Replies ({replies.length})
              </h2>
              {replies.length === 0 ? (
                <Card>
                  <CommunityEmptyState
                    icon={MessageSquare}
                    title="No replies yet"
                    description="Be the first to respond. Keep feedback constructive and specific."
                    primaryAction={{ label: 'Write a reply', onClick: () => undefined }}
                  />
                </Card>
              ) : (
                <ul className="space-y-3">
                  {replies.map((reply) => (
                    <li key={reply._id}>
                      <Card>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-label-sm font-medium text-on-surface">
                            {reply.authorName ?? 'Community member'}
                          </span>
                          <span className="text-label-xs text-on-surface-variant">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-body-md text-on-surface whitespace-pre-wrap">
                          {reply.body}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-label-xs text-on-surface-variant">
                          <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                          {reply.helpfulCount} helpful
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Card>
              <h2 className="text-headline-sm text-on-surface font-semibold mb-3">
                Add a reply
              </h2>
              <ThreadReplyForm
                onSubmit={handleReply}
                submitting={submittingReply}
              />
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
