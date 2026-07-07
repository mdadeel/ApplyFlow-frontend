import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, Handshake } from '../../lib/icons'
import { useToast } from '../../components/layout/useToast'

export function ReferralRequestPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit to API
    showToast('Referral request submitted — the community will be notified', 'success')
    navigate('/community/referrals')
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/community/referrals')}
          className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to referrals
        </button>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <h1 className="text-headline-lg text-on-surface font-semibold">Request a Referral</h1>
              <p className="text-body-md text-on-surface-variant">
                Ask the community to refer you for a role
              </p>
            </div>

            <div>
              <label htmlFor="ref-company" className="block text-label-md text-on-surface font-medium mb-1">
                Company
              </label>
              <input
                id="ref-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, Airbnb"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="ref-role" className="block text-label-md text-on-surface font-medium mb-1">
                Target Role
              </label>
              <input
                id="ref-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button variant="secondary" onClick={() => navigate('/community/referrals')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={!company.trim() || !role.trim()}>
                <Handshake size={16} />
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
