import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import type { Opportunity } from '../../services/community/opportunities'
import { getOpportunity } from '../../services/community/opportunities'
import type { Contribution, ContributionType } from '../../services/community/contributions'
import { getContributions, createContribution } from '../../services/community/contributions'
import { createWorkspace } from '../../services/community/workspaces'
import { ContributionForm } from '../../components/community/ContributionForm'
import {
  MapPin, Clock, Globe, ArrowLeft, Loader2, Sparkles, Users, Building
} from '../../lib/icons'

const LOCATION_BADGES: Record<string, string> = {
  remote: 'bg-emerald-500/10 text-emerald-600',
  hybrid: 'bg-amber-500/10 text-amber-600',
  onsite: 'bg-blue-500/10 text-blue-600',
}

const CONTRIBUTION_TYPE_ICONS: Record<string, string> = {
  interview_insight: '🎙️',
  salary_update: '💰',
  culture_review: '🏢',
  referral_available: '🤝',
  application_tip: '💡',
  skill_suggestion: '🔧',
  jd_verification: '✅',
  deadline_update: '📅',
  general: '📝',
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [showContributionForm, setShowContributionForm] = useState(false)
  const [applying, setApplying] = useState(false)

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

  const handleContribute = async (type: ContributionType, title: string, body: string, isAnonymous?: boolean) => {
    if (!id) return
    const contrib = await createContribution(id, { type, title, body, isAnonymous })
    setContributions(prev => [contrib, ...prev])
    setShowContributionForm(false)
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
  const isUrgent = deadline && deadline.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

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
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-headline-lg text-on-surface font-semibold">{opportunity.title}</h1>
                <p className="text-headline-sm text-on-surface-variant flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4" />
                  {opportunity.company}
                </p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-label-sm font-medium ${LOCATION_BADGES[opportunity.locationType] || ''}`}>
                {opportunity.locationType}
              </span>
            </div>

            {opportunity.location && (
              <div className="flex items-center gap-1.5 text-body-md text-on-surface-variant mb-3">
                <MapPin className="w-4 h-4" />
                {opportunity.location}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-4 text-label-sm text-on-surface-variant">
              {opportunity.salaryMin && (
                <span>💰 ${opportunity.salaryMin.toLocaleString()}{opportunity.salaryMax ? ` - $${opportunity.salaryMax.toLocaleString()}` : ''} / {opportunity.salaryInterval}</span>
              )}
              {opportunity.roleLevel && <span>📊 {opportunity.roleLevel}</span>}
              {opportunity.employmentType && <span>📋 {opportunity.employmentType}</span>}
              {deadline && (
                <span className={`flex items-center gap-1 ${isUrgent ? 'text-red-500' : ''}`}>
                  <Clock className="w-3.5 h-3.5" />
                  Deadline: {deadline.toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-on-surface mb-4">
              <p className="text-body-md whitespace-pre-wrap">{opportunity.description}</p>
            </div>

            {opportunity.requiredSkills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-label-md text-on-surface-variant mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.requiredSkills.map(s => (
                    <span key={s} className="px-3 py-1 bg-primary/5 text-primary rounded-full text-label-sm border border-primary/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-headline-md text-on-surface font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Contributions ({contributions.length})
              </h2>
              <button
                onClick={() => setShowContributionForm(!showContributionForm)}
                className="text-label-sm text-primary hover:underline"
              >
                {showContributionForm ? 'Cancel' : 'Add Contribution'}
              </button>
            </div>

            {showContributionForm && (
              <div className="mb-4">
                <ContributionForm onSubmit={handleContribute} />
              </div>
            )}

            {contributions.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-md">No contributions yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {contributions.map(c => (
                  <div key={c._id} className="p-3 rounded-lg bg-surface-container-low border border-outline-variant">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{CONTRIBUTION_TYPE_ICONS[c.type] || '📝'}</span>
                      <span className="text-label-sm text-on-surface-variant px-1.5 py-0.5 bg-surface-container-high rounded">{c.type}</span>
                      <span className="text-label-xs text-on-surface-variant ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-body-md text-on-surface font-medium">{c.title}</h4>
                    <p className="text-body-sm text-on-surface-variant mt-1">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-lg">
          <Card>
            <h3 className="text-headline-sm text-on-surface font-semibold mb-3">Actions</h3>
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-label-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mb-2"
            >
              <Sparkles className="w-4 h-4" />
              {applying ? 'Opening workspace...' : 'Apply with AI'}
            </button>
            <button
              onClick={() => navigate(`/community/contribute/${opportunity._id}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-label-md font-medium"
            >
              <Users className="w-4 h-4" />
              Add Contribution
            </button>
          </Card>

          {opportunity.requiredSkills.length > 0 && (
            <Card>
              <h3 className="text-headline-sm text-on-surface font-semibold mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.requiredSkills.map(s => (
                  <span key={s} className="px-2 py-1 bg-surface-container-low rounded text-label-xs text-on-surface-variant border border-outline-variant">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
