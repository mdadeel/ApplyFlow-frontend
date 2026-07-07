/**
 * Learning System API Service
 *
 * Provides typed access to the engine learning endpoints:
 * - Suggestions: view, refresh, reset
 * - Feedback: view with filters
 * - Status: full system status
 */

import { get, post } from './api'

// ── Types ───────────────────────────────────────────────────────────

export interface SuggestionItem {
  stage: string
  field: string
  currentValue: number | string
  suggestedValue: number | string
  reason: string
  pattern: string
}

export interface SuggestionsResponse {
  count: number
  lastUpdated: string | null
  active: boolean
  suggestions: SuggestionItem[]
}

export interface PatternReportItem {
  type: string
  section?: string
  severity: string
  frequency: number
  description: string
  suggestedAction: string
}

export interface RefreshResponse {
  patternsFound: number
  suggestionsGenerated: number
  changesApplied: number
  report: {
    generatedAt: number
    patterns: PatternReportItem[]
  }
  suggestions: Array<{
    stage: string
    field: string
    from: number | string
    to: number | string
    reason: string
  }>
}

export interface FeedbackEventItem {
  source: string
  phase: string
  section?: string
  score: number
  rating?: string
  timestamp: number
  diff?: string
  hasOriginal: boolean
  hasEdited: boolean
}

export interface FeedbackResponse {
  total: number
  displayed: number
  source: string
  events: FeedbackEventItem[]
}

export interface StatusResponse {
  patterns: {
    total: number
    generatedAt: number
    byType: Record<string, number>
  }
  suggestions: {
    active: boolean
    count: number
  }
  feedback: {
    total: number
    bySource: Record<string, number>
  }
  metrics: {
    totalRuns: number
    byStage: Record<string, {
      totalRuns: number
      avgLatency: number
      passCount: number
      failCount: number
      avgRetryCount: number
      avgScore: number
    }>
  }
  analytics: Record<string, number>
}

// ── API Functions ───────────────────────────────────────────────────

const BASE = '/v1/engine/learning'

/** Get current auto-tuning suggestions. */
export async function getSuggestions(): Promise<SuggestionsResponse> {
  return get<SuggestionsResponse>(`${BASE}/suggestions`)
}

/** Force re-run pattern detection and regenerate suggestions. */
export async function refreshSuggestions(): Promise<RefreshResponse> {
  return post<RefreshResponse>(`${BASE}/suggestions/refresh`)
}

/** Reset all learning suggestions. */
export async function resetSuggestions(): Promise<{ ok: boolean; message: string }> {
  return post<{ ok: boolean; message: string }>(`${BASE}/suggestions/reset`)
}

/** Get recent feedback events. */
export async function getFeedback(source?: string, limit?: number): Promise<FeedbackResponse> {
  return get<FeedbackResponse>(`${BASE}/feedback`, { source, limit })
}

/** Get full learning system status. */
export async function getLearningStatus(): Promise<StatusResponse> {
  return get<StatusResponse>(`${BASE}/status`)
}
