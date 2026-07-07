import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, Handshake } from '../../lib/icons'
import { useToast } from '../../components/layout/useToast'
import { createReferral } from '../../services/community/referrals'

const MIN_MESSAGE_LENGTH = 20
const MAX_MESSAGE_LENGTH = 500

export function OfferReferralPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [company, setCompany] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [opportunityId, setOpportunityId] = useState('')
  const [location, setLocation] = useState('')
  const [roleLevel, setRoleLevel] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedMessage = message.trim()
  const messageError =
    trimmedMessage.length === 0
      ? null
      : trimmedMessage.length < MIN_MESSAGE_LENGTH
        ? `Please add at least ${MIN_MESSAGE_LENGTH} characters about what you’re looking for.`
        : trimmedMessage.length > MAX_MESSAGE_LENGTH
          ? `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`
          : null

  const canSubmit =
    company.trim().length > 0 &&
    trimmedMessage.length >= MIN_MESSAGE_LENGTH &&
    trimmedMessage.length <= MAX_MESSAGE_LENGTH &&
    !submitting

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await createReferral({
        type: 'offer',
        userId: '',
        company: company.trim(),
        roleTitle: roleTitle.trim() || undefined,
        opportunityId: opportunityId.trim() || undefined,
        location: location.trim() || undefined,
        roleLevel: roleLevel.trim() || undefined,
        message: trimmedMessage,
      })
      showToast('Your referral offer is live.', 'success')
      navigate('/community/referrals?tab=my-referrals')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit referral offer.'
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
          onClick={() => navigate('/community/referrals')}
          className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to referrals
        </button>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-md" noValidate>
            <div>
              <h1 className="text-headline-lg text-on-surface font-semibold">
                Offer a referral
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Help a peer by referring them to your team.
              </p>
            </div>

            <div>
              <label
                htmlFor="offer-company"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Company <span className="text-error">*</span>
              </label>
              <input
                id="offer-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Where can you refer?"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="offer-role"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Role or team
              </label>
              <input
                id="offer-role"
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Platform team, Senior Engineer"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label
                  htmlFor="offer-location"
                  className="block text-label-md text-on-surface font-medium mb-1"
                >
                  Location
                </label>
                <input
                  id="offer-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, New York"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="offer-role-level"
                  className="block text-label-md text-on-surface font-medium mb-1"
                >
                  Levels you can refer
                </label>
                <select
                  id="offer-role-level"
                  value={roleLevel}
                  onChange={(e) => setRoleLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                >
                  <option value="">Any level</option>
                  <option value="intern">Intern</option>
                  <option value="entry">Entry level</option>
                  <option value="mid">Mid level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="offer-opportunity"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Opportunity link (optional)
              </label>
              <input
                id="offer-opportunity"
                type="text"
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                placeholder="Paste an opportunity ID from Community"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="offer-message"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Message <span className="text-error">*</span>
              </label>
              <textarea
                id="offer-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What kinds of candidates are you looking for? How should they reach out?"
                rows={5}
                maxLength={MAX_MESSAGE_LENGTH}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors resize-y"
                required
                aria-describedby="offer-message-counter"
              />
              <div
                id="offer-message-counter"
                className="flex items-center justify-between mt-1 text-label-xs"
              >
                <span className={messageError ? 'text-error' : 'text-on-surface-variant'}>
                  {messageError ?? `Minimum ${MIN_MESSAGE_LENGTH} characters.`}
                </span>
                <span className="text-on-surface-variant">
                  {trimmedMessage.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-body-sm text-error" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => navigate('/community/referrals')}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!canSubmit}
                loading={submitting}
              >
                <Handshake size={16} aria-hidden="true" />
                Publish offer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
