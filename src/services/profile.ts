import { get, getArray, post, put, del } from './api'
import type { Experience, Project, Skill, Education, Certificate, ExtractedProfile } from '../types'

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

export const profileService = {
  getExperiences, createExperience, updateExperience, deleteExperience,
  getProjects, createProject, updateProject, deleteProject,
  getSkills, createSkill, updateSkill, deleteSkill,
  getEducation, createEducation, updateEducation, deleteEducation,
  getCertificates, createCertificate, updateCertificate, deleteCertificate,
  getPersonal, updatePersonal,
  uploadResumePDF,
}
