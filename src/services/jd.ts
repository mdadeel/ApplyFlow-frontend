import { get, post } from './api'
import type { JDAnalysis } from '../types'

export function analyzeJD(jdText: string): Promise<JDAnalysis & { _id: string }> {
  return post<JDAnalysis & { _id: string }>('/jd/analyze', { jdText })
}

export async function getRecentAnalyses(limit = 50): Promise<any[]> {
  const res = await get<{ analyses: any[] }>(`/api/v1/jd-analyses?limit=${limit}`)
  return res.analyses
}

export const jdService = { analyzeJD, getRecentAnalyses }
