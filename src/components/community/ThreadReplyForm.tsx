import { useState } from 'react'
import { Button } from '../ui/Button'
import { Send } from '../../lib/icons'

interface ThreadReplyFormProps {
  onSubmit: (body: string) => Promise<void> | void
  submitting?: boolean
  placeholder?: string
}

const MIN_BODY = 2
const MAX_BODY = 5_000

/**
 * Inline form for posting a reply on a discussion thread.
 *
 * Validates body length on the client (>=2 chars, <=5000) and exposes a
 * disabled state when the parent is already submitting.
 */
export function ThreadReplyForm({
  onSubmit,
  submitting = false,
  placeholder = 'Write a reply...',
}: ThreadReplyFormProps) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const trimmed = body.trim()
  const tooShort = trimmed.length < MIN_BODY
  const tooLong = trimmed.length > MAX_BODY
  const isInvalid = tooShort || tooLong

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isInvalid) {
      setError(
        tooShort
          ? `Reply must be at least ${MIN_BODY} characters.`
          : `Reply must be ${MAX_BODY} characters or fewer.`,
      )
      return
    }
    setError(null)
    try {
      await onSubmit(trimmed)
      setBody('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post reply.'
      setError(message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="thread-reply-form"
      className="space-y-2"
    >
      <label htmlFor="thread-reply-body" className="sr-only">
        Reply
      </label>
      <textarea
        id="thread-reply-body"
        data-testid="thread-reply-body"
        value={body}
        onChange={(event) => {
          setBody(event.target.value)
          if (error) setError(null)
        }}
        placeholder={placeholder}
        rows={4}
        disabled={submitting}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'thread-reply-error' : undefined}
        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors resize-y disabled:opacity-60"
      />

      <div className="flex items-center justify-between gap-2">
        <p
          id="thread-reply-counter"
          className="text-label-xs text-on-surface-variant"
          aria-live="polite"
        >
          {trimmed.length}/{MAX_BODY}
        </p>
        <Button
          type="submit"
          variant="primary"
          data-testid="thread-reply-submit"
          disabled={isInvalid || submitting}
          loading={submitting}
          icon={!submitting ? <Send className="w-4 h-4" /> : undefined}
        >
          {submitting ? 'Posting...' : 'Post reply'}
        </Button>
      </div>

      {error && (
        <p
          id="thread-reply-error"
          data-testid="thread-reply-error"
          role="alert"
          className="text-label-sm text-error"
        >
          {error}
        </p>
      )}
    </form>
  )
}
