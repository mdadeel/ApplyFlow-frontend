import { get, getArray, post, put, del } from './api'
import type { Experience, Project, Skill, Education, Certificate, Award, Publication, Volunteering, Language, Interest, ExtractedProfile } from '../types'

export interface PersonalData {
  name: string
  email: string
  phone?: string
  location?: string
  title?: string
  summary?: string
  portfolio?: string
  linkedIn?: string
  github?: string
}

export function getExperiences(): Promise<Experience[]> {
  return getArray<Experience>('/profile/experiences')
}
export function createExperience(data: Omit<Experience, '_id'>): Promise<Experience> {
  return post<Experience>('/profile/experiences', data)
}
export function updateExperience(id: string, data: Partial<Experience>): Promise<Experience> {
  return put<Experience>(`/profile/experiences/${id}`, data)
}
export function deleteExperience(id: string): Promise<void> {
  return del<void>(`/profile/experiences/${id}`)
}

export function getProjects(): Promise<Project[]> {
  return getArray<Project>('/profile/projects')
}
export function createProject(data: Omit<Project, '_id'>): Promise<Project> {
  return post<Project>('/profile/projects', data)
}
export function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return put<Project>(`/profile/projects/${id}`, data)
}
export function deleteProject(id: string): Promise<void> {
  return del<void>(`/profile/projects/${id}`)
}

export function getSkills(): Promise<Skill[]> {
  return getArray<Skill>('/profile/skills')
}
export function createSkill(data: Omit<Skill, '_id'>): Promise<Skill> {
  return post<Skill>('/profile/skills', data)
}
export function updateSkill(id: string, data: Partial<Skill>): Promise<Skill> {
  return put<Skill>(`/profile/skills/${id}`, data)
}
export function deleteSkill(id: string): Promise<void> {
  return del<void>(`/profile/skills/${id}`)
}

export function getEducation(): Promise<Education[]> {
  return getArray<Education>('/profile/education')
}
export function createEducation(data: Omit<Education, '_id'>): Promise<Education> {
  return post<Education>('/profile/education', data)
}
export function updateEducation(id: string, data: Partial<Education>): Promise<Education> {
  return put<Education>(`/profile/education/${id}`, data)
}
export function deleteEducation(id: string): Promise<void> {
  return del<void>(`/profile/education/${id}`)
}

export function getCertificates(): Promise<Certificate[]> {
  return getArray<Certificate>('/profile/certificates')
}
export function createCertificate(data: Omit<Certificate, '_id'>): Promise<Certificate> {
  return post<Certificate>('/profile/certificates', data)
}
export function updateCertificate(id: string, data: Partial<Certificate>): Promise<Certificate> {
  return put<Certificate>(`/profile/certificates/${id}`, data)
}
export function deleteCertificate(id: string): Promise<void> {
  return del<void>(`/profile/certificates/${id}`)
}

export function getPersonal(): Promise<PersonalData> {
  return get<PersonalData>('/profile/personal')
}
export function updatePersonal(data: Partial<PersonalData>): Promise<PersonalData> {
  return put<PersonalData>('/profile/personal', data)
}

export function uploadResumePDF(file: File): Promise<{ extracted: ExtractedProfile }> {
  const form = new FormData()
  form.append('resume', file)
  return post<{ extracted: ExtractedProfile }>('/profile/upload-pdf', form)
}

export interface FullProfile {
  personal: PersonalData | null
  experiences: Experience[]
  projects: Project[]
  skills: Skill[]
  education: Education[]
  certificates: Certificate[]
  awards: Award[]
  publications: Publication[]
  volunteering: Volunteering[]
  languages: Language[]
  interests: Interest[]
}

export function getFullProfile(): Promise<FullProfile> {
  return get<FullProfile>('/profile/all')
}

export function getAwards(): Promise<Award[]> {
  return getArray<Award>('/profile/awards')
}
export function createAward(data: Omit<Award, '_id'>): Promise<Award> {
  return post<Award>('/profile/awards', data)
}
export function updateAward(id: string, data: Partial<Award>): Promise<Award> {
  return put<Award>(`/profile/awards/${id}`, data)
}
export function deleteAward(id: string): Promise<void> {
  return del<void>(`/profile/awards/${id}`)
}

export function getPublications(): Promise<Publication[]> {
  return getArray<Publication>('/profile/publications')
}
export function createPublication(data: Omit<Publication, '_id'>): Promise<Publication> {
  return post<Publication>('/profile/publications', data)
}
export function updatePublication(id: string, data: Partial<Publication>): Promise<Publication> {
  return put<Publication>(`/profile/publications/${id}`, data)
}
export function deletePublication(id: string): Promise<void> {
  return del<void>(`/profile/publications/${id}`)
}

export function getVolunteering(): Promise<Volunteering[]> {
  return getArray<Volunteering>('/profile/volunteering')
}
export function createVolunteering(data: Omit<Volunteering, '_id'>): Promise<Volunteering> {
  return post<Volunteering>('/profile/volunteering', data)
}
export function updateVolunteering(id: string, data: Partial<Volunteering>): Promise<Volunteering> {
  return put<Volunteering>(`/profile/volunteering/${id}`, data)
}
export function deleteVolunteering(id: string): Promise<void> {
  return del<void>(`/profile/volunteering/${id}`)
}

export function getLanguages(): Promise<Language[]> {
  return getArray<Language>('/profile/languages')
}
export function createLanguage(data: Omit<Language, '_id'>): Promise<Language> {
  return post<Language>('/profile/languages', data)
}
export function updateLanguage(id: string, data: Partial<Language>): Promise<Language> {
  return put<Language>(`/profile/languages/${id}`, data)
}
export function deleteLanguage(id: string): Promise<void> {
  return del<void>(`/profile/languages/${id}`)
}

export function getInterests(): Promise<Interest[]> {
  return getArray<Interest>('/profile/interests')
}
export function createInterest(data: Omit<Interest, '_id'>): Promise<Interest> {
  return post<Interest>('/profile/interests', data)
}
export function updateInterest(id: string, data: Partial<Interest>): Promise<Interest> {
  return put<Interest>(`/profile/interests/${id}`, data)
}
export function deleteInterest(id: string): Promise<void> {
  return del<void>(`/profile/interests/${id}`)
}

export const profileService = {
  getExperiences, createExperience, updateExperience, deleteExperience,
  getProjects, createProject, updateProject, deleteProject,
  getSkills, createSkill, updateSkill, deleteSkill,
  getEducation, createEducation, updateEducation, deleteEducation,
  getCertificates, createCertificate, updateCertificate, deleteCertificate,
  getAwards, createAward, updateAward, deleteAward,
  getPublications, createPublication, updatePublication, deletePublication,
  getVolunteering, createVolunteering, updateVolunteering, deleteVolunteering,
  getLanguages, createLanguage, updateLanguage, deleteLanguage,
  getInterests, createInterest, updateInterest, deleteInterest,
  getPersonal, updatePersonal,
  uploadResumePDF,
  getFullProfile,
}
