import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, MessageSquare } from '../../lib/icons'
import { useToast } from '../../components/layout/useToast'
import {
  createDiscussion,
  DISCUSSION_CHANNELS,
  DISCUSSION_CHANNEL_LABELS,
  type DiscussionChannel,
} from '../../services/community/discussions'

const MIN_TITLE = 4
const MAX_TITLE = 140
const MIN_BODY = 10
const MAX_BODY = 10_000

function isValidChannel(value: string | undefined): value is DiscussionChannel {
  return (
    typeof value === 'string' &&
    (DISCUSSION_CHANNELS as string[]).includes(value)
  )
}

export function CreateDiscussionPage() {
  const navigate = useNavigate()
  const { channel: channelParam } = useParams<{ channel?: string }>()
  const { showToast } = useToast()

  const [channel, setChannel] = useState<DiscussionChannel>(
    isValidChannel(channelParam) ? channelParam : 'general',
  )
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync channel from URL when the user lands here via a deep link.
  useEffect(() => {
    if (isValidChannel(channelParam)) {
      setChannel(channelParam)
    }
  }, [channelParam])

  const trimmedTitle = title.trim()
  const trimmedBody = body.trim()
  const titleInvalid =
    trimmedTitle.length < MIN_TITLE || trimmedTitle.length > MAX_TITLE
  const bodyInvalid =
    trimmedBody.length < MIN_BODY || trimmedBody.length > MAX_BODY
  const formInvalid = titleInvalid || bodyInvalid

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (formInvalid) {
      setError(
        titleInvalid
          ? `Title must be between ${MIN_TITLE} and ${MAX_TITLE} characters.`
          : `Body must be between ${MIN_BODY} and ${MAX_BODY} characters.`,
      )
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const created = await createDiscussion({
        channel,
        title: trimmedTitle,
        body: trimmedBody,
      })
      showToast('Discussion posted', 'success')
      navigate(`/community/discussions/${created._id}`, { replace: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to post discussion.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/community/discussions')}
          className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to discussions
        </button>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-md" noValidate>
            <div>
              <h1 className="text-headline-lg text-on-surface font-semibold">
                New Discussion
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Start a conversation with the community
              </p>
            </div>

            <div>
              <label
                htmlFor="discussion-channel"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Channel
              </label>
              <select
                id="discussion-channel"
                data-testid="discussion-channel"
                value={channel}
                onChange={(event) => {
                  if (isValidChannel(event.target.value)) {
                    setChannel(event.target.value)
                  }
                }}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition-colors"
              >
                {DISCUSSION_CHANNELS.map((value) => (
                  <option key={value} value={value}>
                    {DISCUSSION_CHANNEL_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="discussion-title"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Title
              </label>
              <input
                id="discussion-title"
                data-testid="discussion-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="What's on your mind?"
                disabled={submitting}
                aria-invalid={titleInvalid && trimmedTitle.length > 0 ? 'true' : 'false'}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
              />
              <p className="text-label-xs text-on-surface-variant mt-1">
                {trimmedTitle.length}/{MAX_TITLE} characters
              </p>
            </div>

            <div>
              <label
                htmlFor="discussion-body"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Details
              </label>
              <textarea
                id="discussion-body"
                data-testid="discussion-body"
                value={body}
                onChange={(event) => {
                  setBody(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="Share your thoughts, ask a question, or start a discussion..."
                rows={8}
                disabled={submitting}
                aria-invalid={bodyInvalid && trimmedBody.length > 0 ? 'true' : 'false'}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors resize-y"
              />
              <p className="text-label-xs text-on-surface-variant mt-1">
                {trimmedBody.length}/{MAX_BODY} characters
              </p>
            </div>

            {error && (
              <p
                role="alert"
                data-testid="discussion-create-error"
                className="text-label-sm text-error"
              >
                {error}
              </p>
            )}

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/community/discussions')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formInvalid || submitting}
                loading={submitting}
              >
                <MessageSquare size={16} />
                Post Discussion
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
