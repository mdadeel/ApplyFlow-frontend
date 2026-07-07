import { get, getArray, post, put } from '../api'

export type ReferralType = 'request' | 'offer'

export type ReferralStatus =
  | 'open'
  | 'matched'
  | 'accepted'
  | 'completed'
  | 'withdrawn'
  | 'expired'

export interface Referral {
  _id: string
  type: ReferralType
  userId: string
  company: string
  roleTitle?: string
  opportunityId?: string
  location?: string
  roleLevel?: string
  message: string
  status: ReferralStatus
  matchedReferralId?: string
  createdAt: string
  updatedAt: string
}

export interface ReferralMatch {
  referralId: string
  matchedReferralId: string
  score: number
}

export interface ReferralMatchResponse {
  referralId: string
  matchedReferralId: string
  score: number
}

export interface ListReferralsParams {
  type?: ReferralType
  status?: ReferralStatus
  company?: string
  mine?: boolean
  page?: number
  limit?: number
}

export type ReferralInput = Omit<
  Referral,
  '_id' | 'status' | 'matchedReferralId' | 'createdAt' | 'updatedAt'
>

const REFERRAL_STATUSES: ReferralStatus[] = [
  'open',
  'matched',
  'accepted',
  'completed',
  'withdrawn',
  'expired',
]

function isReferralStatus(value: string): value is ReferralStatus {
  return (REFERRAL_STATUSES as string[]).includes(value)
}

function normalizeReferral(raw: Partial<Referral> & { _id: string }): Referral {
  const status: ReferralStatus = isReferralStatus(String(raw.status))
    ? (raw.status as ReferralStatus)
    : 'open'
  return {
    _id: raw._id,
    type: raw.type === 'offer' ? 'offer' : 'request',
    userId: raw.userId ?? '',
    company: raw.company ?? '',
    roleTitle: raw.roleTitle,
    opportunityId: raw.opportunityId,
    location: raw.location,
    roleLevel: raw.roleLevel,
    message: raw.message ?? '',
    status,
    matchedReferralId: raw.matchedReferralId,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
  }
}

export async function createReferral(data: ReferralInput): Promise<Referral> {
  const created = await post<Referral>('/v1/community/referrals', data)
  return normalizeReferral(created as Partial<Referral> & { _id: string })
}

export async function listReferrals(
  params: ListReferralsParams = {},
): Promise<{ items: Referral[]; total: number }> {
  const queryParams: Record<string, string | number | undefined> = {
    type: params.type,
    status: params.status,
    company: params.company,
    mine: params.mine ? 'true' : undefined,
    page: params.page,
    limit: params.limit,
  }
  const raw = await get<{
    items?: Referral[]
    total?: number
    data?: Referral[]
    count?: number
  }>('/v1/community/referrals', queryParams)
  const items = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.data)
      ? raw.data
      : []
  const total = typeof raw.total === 'number'
    ? raw.total
    : typeof raw.count === 'number'
      ? raw.count
      : items.length
  return {
    items: items.map((item) =>
      normalizeReferral(item as Partial<Referral> & { _id: string }),
    ),
    total,
  }
}

export async function getReferralMatches(
  referralId: string,
): Promise<ReferralMatchResponse[]> {
  const raw = await getArray<ReferralMatchResponse>(
    `/v1/community/referrals/${referralId}/matches`,
  )
  return raw.map((match) => ({
    referralId: match.referralId ?? referralId,
    matchedReferralId: match.matchedReferralId ?? '',
    score: typeof match.score === 'number' ? match.score : 0,
  }))
}

export async function acceptReferral(
  referralId: string,
  matchedReferralId: string,
): Promise<Referral> {
  const updated = await post<Referral>(`/v1/community/referrals/${referralId}/accept`, {
    matchedReferralId,
  })
  return normalizeReferral(updated as Partial<Referral> & { _id: string })
}

export async function withdrawReferral(referralId: string): Promise<Referral> {
  const updated = await put<Referral>(`/v1/community/referrals/${referralId}/withdraw`)
  return normalizeReferral(updated as Partial<Referral> & { _id: string })
}

export async function markReferralCompleted(
  referralId: string,
): Promise<Referral> {
  const updated = await put<Referral>(`/v1/community/referrals/${referralId}/complete`)
  return normalizeReferral(updated as Partial<Referral> & { _id: string })
}

export { normalizeReferral }
