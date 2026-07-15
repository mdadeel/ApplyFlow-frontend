import { useState } from 'react'
import { jdService } from '../../../services/jd'
import { useToast } from '../../layout/useToast'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Sparkles, ScrollText, AlertTriangle, X } from '../../../lib/icons'
import { JDSummary } from '../JDSummary'
import { Section } from '../../layout/Section'
import type { Application, JDAnalysis } from '../../../types'
import { applicationsService } from '../../../services/applications'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '../../ui/Skeleton'

interface ApplicationMatchProps {
  application: Application
}

export function ApplicationMatch({ application }: ApplicationMatchProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  
  const [jdText, setJdText] = useState(application.jdText || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch analysis if application has a linked jdAnalysisId
  const analysisQuery = useQuery({
    queryKey: ['jd-analysis', application.jdAnalysisId],
    queryFn: () => jdService.getAnalysis(application.jdAnalysisId!),
    enabled: !!application.jdAnalysisId,
  })

  const currentAnalysis = analysisQuery.data

  async function handleAnalyze() {
    if (!jdText.trim()) {
      toast.showToast('Please paste a job description first', 'warning')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await jdService.analyzeJD(jdText)
      
      // Update application with new analysis and scores
      await applicationsService.updateApplication(application._id, {
        jdText,
        jdAnalysisId: result._id,
        scores: {
          match: result.matchScore || 0,
          ats: result.matchScore || 0,
          overall: result.matchScore || 0
        }
      })
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['application', application._id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['jd-analysis', result._id] })

      toast.showToast('JD analyzed successfully', 'success')
    } catch {
      setError('Failed to analyze the job description. The server may be unavailable. Please try again.')
      toast.showToast('Failed to analyze JD', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-lg animate-in fade-in duration-200">
      <div className="flex flex-col gap-4">
        {!currentAnalysis && !analysisQuery.isLoading ? (
          <Card className="p-md">
            <Section
              title="Job Description Analysis"
              description="Paste the full job description to extract skills, keywords, and match score."
            >
              <div className="relative">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full h-80 p-3 bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-md text-body-sm text-text-primary focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 resize-none font-sans"
                />
                {!jdText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <ScrollText className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
                      <p className="text-body-sm text-text-secondary">
                        Paste a job description to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={handleAnalyze} 
                  loading={loading} 
                  className="w-full" 
                  size="lg" 
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Analyze JD
                </Button>
              </div>

              {error && !loading && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-caption text-red-700 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Analysis Failed</p>
                    <p className="text-red-600/90 mt-0.5">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="p-0.5 rounded hover:bg-red-100 transition-colors shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </Section>
          </Card>
        ) : (
          <div className="space-y-4">
            {analysisQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton variant="rectangular" height={100} />
                <Skeleton variant="rectangular" height={300} />
              </div>
            ) : currentAnalysis ? (
              <JDSummary
                analysis={currentAnalysis}
                loading={loading}
                linkedApp={{ company: application.company, role: application.role }}
              />
            ) : null}
            
            {/* Allow re-analysis */}
            {currentAnalysis && (
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-headline-md mb-2">Update Job Description</h3>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full h-32 p-3 mb-2 bg-neutral-50 border border-neutral-300 rounded-md text-body-sm resize-none font-sans"
                />
                <Button 
                  onClick={handleAnalyze} 
                  loading={loading} 
                  variant="secondary"
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Re-Analyze JD
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
