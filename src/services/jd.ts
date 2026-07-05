import { post } from './api'
import type { JDAnalysis } from '../types'

export function analyzeJD(jdText: string): Promise<JDAnalysis & { _id: string }> {
  return post<JDAnalysis & { _id: string }>('/jd/analyze', { jdText })
}

export const jdService = { analyzeJD }
