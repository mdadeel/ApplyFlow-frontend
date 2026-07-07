import { get, post } from '../api'

export type TemplateType = 'resume' | 'cover_letter' | 'email'
export type TemplateRoleLevel = 'intern' | 'entry' | 'mid' | 'senior' | 'lead'

export interface CommunityTemplate {
  _id: string
  userId: string
  title: string
  description: string
  type: TemplateType
  content: string
  tags: string[]
  industry?: string
  roleLevel?: TemplateRoleLevel
  likes: number
  downloads: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface ListTemplatesParams {
  tag?: string
  type?: TemplateType
  limit?: number
}

export async function listTemplates(
  params: ListTemplatesParams = {},
): Promise<{ templates: CommunityTemplate[] }> {
  const query: Record<string, string | number | undefined> = {
    tag: params.tag,
    type: params.type,
    limit: params.limit,
  }
  const raw = await get<{ templates?: CommunityTemplate[]; data?: CommunityTemplate[] }>(
    '/v1/community/templates',
    query,
  )
  const items = raw.templates ?? raw.data ?? []
  return { templates: items }
}

export async function getTemplate(id: string): Promise<CommunityTemplate> {
  return get<CommunityTemplate>(`/v1/community/templates/${id}`)
}

export async function createTemplate(input: {
  title: string
  description: string
  type: TemplateType
  content: string
  tags: string[]
  industry?: string
  roleLevel?: TemplateRoleLevel
  isPublished?: boolean
}): Promise<CommunityTemplate> {
  return post<CommunityTemplate>('/v1/community/templates', input)
}

export async function likeTemplate(id: string): Promise<{ template: CommunityTemplate; liked: boolean }> {
  return post<{ template: CommunityTemplate; liked: boolean }>(`/v1/community/templates/${id}/like`, {})
}

export async function downloadTemplate(id: string): Promise<string> {
  return post<string>(`/v1/community/templates/${id}/download`, {})
}