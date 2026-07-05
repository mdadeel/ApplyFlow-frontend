import { get } from './api'
import type { AnalyticsSummary } from '../types'

export interface ChartDataPoint {
  date: string
  applications: number
  interviews: number
  offers: number
}

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return get<AnalyticsSummary>('/analytics/summary')
}

export interface ChartDataResponse {
  appsOverTime: ChartDataPoint[]
  statusDistribution: Array<{ status: string; count: number }>
}

export function getChartData(): Promise<ChartDataResponse> {
  return get<ChartDataResponse>('/analytics/chart-data')
}

export function getInsights(): Promise<string[]> {
  return get<string[]>('/analytics/insights')
}

export const analyticsService = { getAnalyticsSummary, getChartData, getInsights }
