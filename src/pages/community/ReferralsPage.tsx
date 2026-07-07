import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { ReferralCard } from '../../components/community/ReferralCard'
import { communityEmptyStates } from '../../components/community/communityEmptyStates'
import { useToast } from '../../components/layout/useToast'
import {
  Handshake,
  Loader2,
  AlertTriangle,
  Plus,
  Users,
} from '../../lib/icons'
import {
  acceptReferral,
  listReferrals,
  markReferralCompleted,
  withdrawReferral,
  type Referral,
  type ReferralStatus,
  type ReferralType,
} from '../../services/community/referrals'

type TabKey = 'open-requests' | 'open-offers' | 'my-referrals'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'open-requests', label: 'Open Requests' },
  { key: 'open-offers', label: 'Open Offers' },
  { key: 'my-referrals', label: 'My Referrals' },
]

function isTabKey(value: string | null): value is TabKey {
  return TABS.some((t) => t.key === value)
}

function tabType(tab: TabKey): ReferralType | undefined {
  if (tab === 'open-requests') return 'request'
  if (tab === 'open-offers') return 'offer'
  return undefined
}

export function ReferralsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: TabKey = isTabKey(rawTab) ? rawTab : 'open-requests'

  const [items, setItems] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const type = tabType(activeTab)
    const params: { type?: ReferralType; status?: ReferralStatus; mine?: boolean } = {}
    if (type) params.type = type
    if (activeTab === 'open-requests' || activeTab === 'open-offers') {
      params.status = 'open'
    }
    if (activeTab === 'my-referrals') {
      params.mine = true
    }
    listReferrals(params)
      .then((response) => {
        if (cancelled) return
        setItems(response.items)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Failed to load referrals.'
        setError(message)
        setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab])

  const handleTabChange = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    setSearchParams(next, { replace: true })
  }

  const filteredItems = useMemo(() => {
    if (activeTab === 'open-requests') {
      return items.filter((r) => r.type === 'request')
    }
    if (activeTab === 'open-offers') {
      return items.filter((r) => r.type === 'offer')
    }
    return items
  }, [activeTab, items])

  const onAccept = async (referral: Referral) => {
    if (!referral.matchedReferralId) {
      showToast('No match available for this referral yet.', 'error')
      return
    }
    setBusyId(referral._id)
    try {
      const updated = await acceptReferral(referral._id, referral.matchedReferralId)
      setItems((prev) => prev.map((r) => (r._id === updated._id ? updated : r)))
      showToast('Referral accepted.', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept referral.'
      showToast(message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const onWithdraw = async (referral: Referral) => {
    setBusyId(referral._id)
    try {
      const updated = await withdrawReferral(referral._id)
      setItems((prev) => prev.map((r) => (r._id === updated._id ? updated : r)))
      showToast('Referral withdrawn.', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to withdraw referral.'
      showToast(message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const onMarkCompleted = async (referral: Referral) => {
    setBusyId(referral._id)
    try {
      const updated = await markReferralCompleted(referral._id)
      setItems((prev) => prev.map((r) => (r._id === updated._id ? updated : r)))
      showToast('Marked as completed.', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to mark completed.'
      showToast(message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const renderEmptyState = () => {
    if (activeTab === 'my-referrals') {
      return <CommunityEmptyState {...communityEmptyStates.referralsMyEmpty} />
    }
    return <CommunityEmptyState {...communityEmptyStates.referralsNoOpen} />
  }

  const showActions = activeTab === 'my-referrals'

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-xl gap-3 flex-wrap">
          <div>
            <h1 className="text-headline-lg text-on-surface font-semibold">
              Referrals
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Request a referral to a target company or offer one to help a peer.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/community/referrals/offer')}
            >
              <Handshake size={16} aria-hidden="true" />
              Offer a referral
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/community/referrals/request')}
            >
              <Plus size={16} aria-hidden="true" />
              Request a referral
            </Button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Referral tabs"
          className="flex items-center gap-1 border-b border-outline-variant mb-md overflow-x-auto"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                data-testid={`referrals-tab-${tab.key}`}
                onClick={() => handleTabChange(tab.key)}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-2 text-label-md transition-colors border-b-2 -mb-px whitespace-nowrap',
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface',
                ].join(' ')}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div
            className="flex items-center justify-center py-20"
            data-testid="referrals-loading"
          >
            <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center justify-center text-center py-xl px-md"
            data-testid="referrals-error"
          >
            <AlertTriangle
              className="w-10 h-10 text-error mb-3"
              aria-hidden="true"
            />
            <h3 className="text-headline-md text-on-surface mb-1">
              Couldn’t load referrals
            </h3>
            <p className="text-body-md text-on-surface-variant mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div data-testid="referrals-empty">{renderEmptyState()}</div>
        ) : (
          <ul
            className="space-y-3"
            data-testid="referrals-list"
            data-tab={activeTab}
          >
            {filteredItems.map((referral) => (
              <li key={referral._id}>
                <ReferralCard
                  referral={referral}
                  busy={busyId === referral._id}
                  showActions={showActions || activeTab === 'open-requests' || activeTab === 'open-offers'}
                  onWithdraw={
                    showActions && referral.status !== 'withdrawn'
                      ? onWithdraw
                      : undefined
                  }
                  onAccept={
                    !showActions && activeTab === 'open-offers'
                      ? onAccept
                      : undefined
                  }
                  onView={(r) =>
                    navigate(`/community/referrals/${r._id}`)
                  }
                />
                {showActions && referral.status === 'accepted' && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === referral._id}
                      onClick={() => onMarkCompleted(referral)}
                      data-testid="referral-card-mark-completed"
                    >
                      Mark as completed
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="mt-md flex items-center justify-center gap-2 text-label-sm text-on-surface-variant">
            <Users className="w-4 h-4" aria-hidden="true" />
            {filteredItems.length} {filteredItems.length === 1 ? 'referral' : 'referrals'} shown
          </div>
        )}
      </div>
    </AppLayout>
  )
}
