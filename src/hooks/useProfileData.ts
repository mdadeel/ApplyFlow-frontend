import { useQuery } from '@tanstack/react-query'
import { profileService } from '../services/profile'
import type { FullProfile } from '../services/profile'
import type { PersonalData } from '../types'

export interface ProfileData {
  personal: PersonalData | null
  experiences: FullProfile['experiences']
  education: FullProfile['education']
  skills: FullProfile['skills']
  projects: FullProfile['projects']
  certificates: FullProfile['certificates']
  awards: FullProfile['awards']
  publications: FullProfile['publications']
  volunteering: FullProfile['volunteering']
  languages: FullProfile['languages']
  interests: FullProfile['interests']
}

export interface ProfileQueryResult {
  data: ProfileData | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetches the full career profile in a single request.
 * Uses the bulk /api/profile/all endpoint.
 */
export function useProfileData(): ProfileQueryResult {
  const query = useQuery({
    queryKey: ['profile', 'full'],
    queryFn: () => profileService.getFullProfile(),
    staleTime: 30 * 1000,
  })

  const data = query.data
    ? {
        personal: query.data.personal as PersonalData | null,
        experiences: query.data.experiences,
        education: query.data.education,
        skills: query.data.skills,
        projects: query.data.projects,
        certificates: query.data.certificates,
        awards: query.data.awards,
        publications: query.data.publications,
        volunteering: query.data.volunteering,
        languages: query.data.languages,
        interests: query.data.interests,
      }
    : undefined

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => query.refetch(),
  }
}
