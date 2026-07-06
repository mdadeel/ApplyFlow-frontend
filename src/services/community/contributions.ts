import { getArray, post, put } from '../api'

export type ContributionType =
  | 'jd_verification'
  | 'salary_update'
  | 'interview_insight'
  | 'culture_review'
  | 'referral_available'
  | 'application_tip'
  | 'skill_suggestion'
  | 'deadline_update'
  | 'general'

export interface Contribution {
  _id: string
  opportunityId: string
  userId: string
  type: ContributionType
  title: string
  body: string
  helpfulCount: number
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}

export function getContributions(opportunityId: string): Promise<Contribution[]> {
  return getArray<Contribution>(`/opportunities/${opportunityId}/contributions`)
}

export function createContribution(
  opportunityId: string,
  data: { type: ContributionType; title: string; body: string; isAnonymous?: boolean },
): Promise<Contribution> {
  return post<Contribution>(`/opportunities/${opportunityId}/contributions`, data)
}

export function markHelpful(opportunityId: string, contributionId: string): Promise<Contribution> {
  return put<Contribution>(`/opportunities/${opportunityId}/contributions/${contributionId}/helpful`)
}
