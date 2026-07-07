import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/layout/useToast'
import type { Opportunity } from '../../services/community/opportunities'
import { getOpportunity } from '../../services/community/opportunities'
import type { Contribution, ContributionType } from '../../services/community/contributions'
import { getContributions, createContribution } from '../../services/community/contributions'
import type { Referral } from '../../components/community/ReferralList'
import { createWorkspace } from '../../services/community/workspaces'
import { ContributionForm } from '../../components/community/ContributionForm'
import { ContributionList } from '../../components/community/ContributionList'
import { ReferralList } from '../../components/community/ReferralList'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { SaveOpportunityButton } from '../../components/community/SaveOpportunityButton'
import { communityEmptyStates } from '../../components/community/communityEmptyStates'
import {
  MapPin,
  Clock,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShareNetwork,
  Globe,
  Handshake,
  Info,
} from '../../lib/icons'

const LOCATION_BADGES: Record<string, string> = {
  remote: 'bg-emerald-500/10 text-emerald-600',
  hybrid: 'bg-amber-500/10 text-amber-600',
  onsite: 'bg-blue-500/10 text-blue-600',
}

type Tab = 'overview' | 'contributions' | 'referrals'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'contributions', label: 'Contributions' },
  { id: 'referrals', label: 'Referrals' },
]

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [referrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [showContributionForm, setShowContributionForm] = useState(false)
  const [applying, setApplying] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getOpportunity(id),
      getContributions(id),
    ])
      .then(([opp, contribs]) => {
        setOpportunity(opp)
        setContributions(contribs)
      })
      .catch(() => navigate('/community/opportunities'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleApply = async () => {
    if (!id) return
    setApplying(true)
    try {
      const ws = await createWorkspace(id)
      navigate(`/community/workspace/${ws._id}`)
    } catch {
      setApplying(false)
    }
  }

  const handleContribute = async (
    type: ContributionType,
    title: string,
    body: string,
    isAnonymous?: boolean,
  ) => {
    if (!id) return
    const contrib = await createContribution(id, {
      type,
      title,
      body,
      isAnonymous,
    })
    setContributions(prev => [contrib, ...prev])
    setShowContributionForm(false)
  }

  const handleToggleHelpful = async (
    opportunityId: string,
    contributionId: string,
    next: boolean,
  ) => {
    // Optimistic update is handled inside ContributionList; this hook is here
    // so we can layer in additional side effects (analytics, etc.) if needed.
    void opportunityId
    void contributionId
    void next
  }

  const handleShare = async () => {
    const url = window.location.href
    setSharing(true)
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard', 'success')
    } catch {
      showToast('Could not copy link', 'error')
    } finally {
      setSharing(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!opportunity) return null

  const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null
  const isUrgent =
    deadline && deadline.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

  return (
    <AppLayout>
      <button
        onClick={() => navigate('/community/opportunities')}
        className="flex items-center gap-1.5 text-label-sm text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to opportunities
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        <div className="lg:col-span-2 space-y-lg">
          {/* Action header */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h1 className="text-headline-lg text-on-surface font-semibold">
                  {opportunity.title}
                </h1>
                <p className="text-headline-sm text-on-surface-variant mt-1">
                  {opportunity.company}
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-label-sm font-medium ${
                  LOCATION_BADGES[opportunity.locationType] || ''
                }`}
              >
                {opportunity.locationType}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleApply}
                disabled={applying}
                loading={applying}
                icon={<Sparkles className="w-4 h-4" aria-hidden="true" />}
                className="flex-1 sm:flex-none"
                data-testid="apply-with-ai"
              >
                {applying ? 'Opening workspace...' : 'Apply with AI'}
              </Button>
              <SaveOpportunityButton
                opportunityId={opportunity._id}
                size="md"
                showLabel
                className="flex-1 sm:flex-none"
              />
              <Button
                variant="secondary"
                size="md"
                onClick={handleShare}
                disabled={sharing}
                icon={<ShareNetwork size={14} aria-hidden="true" />}
                className="flex-1 sm:flex-none"
                data-testid="share-opportunity"
              >
                {sharing ? 'Copying...' : 'Share'}
              </Button>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="p-0 overflow-hidden">
            <div
              role="tablist"
              aria-label="Opportunity sections"
              className="flex items-center gap-1 px-2 pt-2 border-b border-outline-variant"
            >
              {TABS.map(t => {
                const isActive = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tab-panel-${t.id}`}
                    id={`tab-${t.id}`}
                    onClick={() => setActiveTab(t.id)}
                    data-testid={`tab-${t.id}`}
                    className={[
                      'px-3 py-2 text-label-sm font-medium rounded-t-lg transition-colors',
                      isActive
                        ? 'bg-surface text-on-surface border border-outline-variant border-b-transparent'
                        : 'text-on-surface-variant hover:text-on-surface',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            <div
              role="tabpanel"
              id={`tab-panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="p-md"
            >
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {opportunity.location && (
                    <div className="flex items-center gap-1.5 text-body-md text-on-surface-variant">
                      <MapPin className="w-4 h-4" />
                      {opportunity.location}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-label-sm text-on-surface-variant">
                    {opportunity.salaryMin && (
                      <span>
                        💰 ${opportunity.salaryMin.toLocaleString()}
                        {opportunity.salaryMax
                          ? ` - $${opportunity.salaryMax.toLocaleString()}`
                          : ''}{' '}
                        / {opportunity.salaryInterval}
                      </span>
                    )}
                    {opportunity.roleLevel && (
                      <span>📊 {opportunity.roleLevel}</span>
                    )}
                    {opportunity.employmentType && (
                      <span>📋 {opportunity.employmentType}</span>
                    )}
                    {deadline && (
                      <span
                        className={`flex items-center gap-1 ${isUrgent ? 'text-red-500' : ''}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {deadline.toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {opportunity.requiredSkills.length > 0 && (
                    <div>
                      <h3 className="text-label-md text-on-surface-variant mb-2">
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.requiredSkills.map(s => (
                          <span
                            key={s}
                            className="px-3 py-1 bg-primary/5 text-primary rounded-full text-label-sm border border-primary/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {opportunity.description && (
                    <div className="prose prose-sm max-w-none text-on-surface">
                      <p className="text-body-md whitespace-pre-wrap">
                        {opportunity.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contributions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-headline-md text-on-surface font-semibold flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Contributions ({contributions.length})
                    </h2>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowContributionForm(s => !s)}
                    >
                      {showContributionForm ? 'Cancel' : 'Add Contribution'}
                    </Button>
                  </div>

                  {showContributionForm && (
                    <ContributionForm onSubmit={handleContribute} />
                  )}

                  {contributions.length === 0 ? (
                    <CommunityEmptyState
                      {...communityEmptyStates.opportunityNoContributions}
                      primaryAction={{
                        label: 'Add insight',
                        onClick: () => setShowContributionForm(true),
                      }}
                    />
                  ) : (
                    <ContributionList
                      opportunityId={opportunity._id}
                      contributions={contributions}
                      onToggleHelpful={handleToggleHelpful}
                    />
                  )}
                </div>
              )}

              {activeTab === 'referrals' && (
                <div className="space-y-4">
                  <h2 className="text-headline-md text-on-surface font-semibold flex items-center gap-2">
                    <Handshake className="w-5 h-5" />
                    Referrals
                  </h2>
                  {referrals.length === 0 ? (
                    <CommunityEmptyState
                      {...communityEmptyStates.opportunityNoReferrals}
                    />
                  ) : (
                    <ReferralList
                      referrals={referrals}
                      companyName={opportunity.company}
                    />
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-lg">
          <Card>
            <h3 className="text-headline-sm text-on-surface font-semibold mb-3">
              Actions
            </h3>
            <Button
              variant="primary"
              size="lg"
              onClick={handleApply}
              disabled={applying}
              loading={applying}
              icon={<Sparkles className="w-4 h-4" aria-hidden="true" />}
              className="w-full mb-2"
              data-testid="apply-with-ai-sidebar"
            >
              {applying ? 'Opening workspace...' : 'Apply with AI'}
            </Button>
            <div className="w-full mb-2">
              <SaveOpportunityButton
                opportunityId={opportunity._id}
                size="md"
                showLabel
                className="w-full"
              />
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={handleShare}
              disabled={sharing}
              icon={<ShareNetwork size={14} aria-hidden="true" />}
              className="w-full"
              data-testid="share-opportunity-sidebar"
            >
              {sharing ? 'Copying...' : 'Share'}
            </Button>
          </Card>

          <Card>
            <div className="flex items-start gap-2 text-body-sm text-on-surface-variant">
              <Info
                size={14}
                className="shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p>
                Community insights are member-submitted. Always verify before
                acting.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <Handshake size={14} aria-hidden="true" />
              <span>{referrals.length} open referrals</span>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
