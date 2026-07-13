import { useMutation } from '@tanstack/react-query'
import { profileService } from '../services/profile'
import type { Experience, Project, Skill, Education, Certificate, Award, Publication, Volunteering, Language, Interest } from '../types'

// ---------------------------------------------------------------------------
// Experience mutations
// ---------------------------------------------------------------------------
export function useCreateExperience() {
  return useMutation({
    mutationFn: (data: Omit<Experience, '_id'>) => profileService.createExperience(data),
  })
}
export function useUpdateExperience() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) =>
      profileService.updateExperience(id, data),
  })
}
export function useDeleteExperience() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteExperience(id),
  })
}

// ---------------------------------------------------------------------------
// Project mutations
// ---------------------------------------------------------------------------
export function useCreateProject() {
  return useMutation({
    mutationFn: (data: Omit<Project, '_id'>) => profileService.createProject(data),
  })
}
export function useUpdateProject() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      profileService.updateProject(id, data),
  })
}
export function useDeleteProject() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteProject(id),
  })
}

// ---------------------------------------------------------------------------
// Skill mutations
// ---------------------------------------------------------------------------
export function useCreateSkill() {
  return useMutation({
    mutationFn: (data: Omit<Skill, '_id'>) => profileService.createSkill(data),
  })
}
export function useUpdateSkill() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) =>
      profileService.updateSkill(id, data),
  })
}
export function useDeleteSkill() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteSkill(id),
  })
}

// ---------------------------------------------------------------------------
// Education mutations
// ---------------------------------------------------------------------------
export function useCreateEducation() {
  return useMutation({
    mutationFn: (data: Omit<Education, '_id'>) => profileService.createEducation(data),
  })
}
export function useUpdateEducation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Education> }) =>
      profileService.updateEducation(id, data),
  })
}
export function useDeleteEducation() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteEducation(id),
  })
}

// ---------------------------------------------------------------------------
// Certificate mutations
// ---------------------------------------------------------------------------
export function useCreateCertificate() {
  return useMutation({
    mutationFn: (data: Omit<Certificate, '_id'>) => profileService.createCertificate(data),
  })
}
export function useUpdateCertificate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Certificate> }) =>
      profileService.updateCertificate(id, data),
  })
}
export function useDeleteCertificate() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteCertificate(id),
  })
}

// ---------------------------------------------------------------------------
// Award mutations
// ---------------------------------------------------------------------------
export function useCreateAward() {
  return useMutation({
    mutationFn: (data: Omit<Award, '_id'>) => profileService.createAward(data),
  })
}
export function useUpdateAward() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Award> }) =>
      profileService.updateAward(id, data),
  })
}
export function useDeleteAward() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteAward(id),
  })
}

// ---------------------------------------------------------------------------
// Publication mutations
// ---------------------------------------------------------------------------
export function useCreatePublication() {
  return useMutation({
    mutationFn: (data: Omit<Publication, '_id'>) => profileService.createPublication(data),
  })
}
export function useUpdatePublication() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Publication> }) =>
      profileService.updatePublication(id, data),
  })
}
export function useDeletePublication() {
  return useMutation({
    mutationFn: (id: string) => profileService.deletePublication(id),
  })
}

// ---------------------------------------------------------------------------
// Volunteering mutations
// ---------------------------------------------------------------------------
export function useCreateVolunteering() {
  return useMutation({
    mutationFn: (data: Omit<Volunteering, '_id'>) => profileService.createVolunteering(data),
  })
}
export function useUpdateVolunteering() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Volunteering> }) =>
      profileService.updateVolunteering(id, data),
  })
}
export function useDeleteVolunteering() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteVolunteering(id),
  })
}

// ---------------------------------------------------------------------------
// Language mutations
// ---------------------------------------------------------------------------
export function useCreateLanguage() {
  return useMutation({
    mutationFn: (data: Omit<Language, '_id'>) => profileService.createLanguage(data),
  })
}
export function useUpdateLanguage() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Language> }) =>
      profileService.updateLanguage(id, data),
  })
}
export function useDeleteLanguage() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteLanguage(id),
  })
}

// ---------------------------------------------------------------------------
// Interest mutations
// ---------------------------------------------------------------------------
export function useCreateInterest() {
  return useMutation({
    mutationFn: (data: Omit<Interest, '_id'>) => profileService.createInterest(data),
  })
}
export function useUpdateInterest() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Interest> }) =>
      profileService.updateInterest(id, data),
  })
}
export function useDeleteInterest() {
  return useMutation({
    mutationFn: (id: string) => profileService.deleteInterest(id),
  })
}
