import { get } from './api'

export interface StatusDefinition {
  value: string
  label: string
}

export interface StatusDefinitionsResponse {
  statuses: StatusDefinition[]
  transitions: Record<string, string[]>
}

let cachedPromise: Promise<StatusDefinitionsResponse> | null = null

export function getStatusDefinitions(): Promise<StatusDefinitionsResponse> {
  if (!cachedPromise) {
    cachedPromise = get<StatusDefinitionsResponse>('/applications/statuses')
  }
  return cachedPromise
}

export function invalidateStatusCache(): void {
  cachedPromise = null
}
