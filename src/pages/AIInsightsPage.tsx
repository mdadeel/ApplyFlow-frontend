import { useState, useEffect } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { analyticsService } from '../services/analytics'
import { Lightbulb, Info, AlertTriangle, CheckCircle, Sparkles } from '../lib/icons'

function insightSeverity(message: string): 'positive' | 'warning' | 'info' {
  const lower = message.toLowerCase()
  if (lower.includes('offer') || lower.includes('great') || lower.includes('progress')) return 'positive'
  if (lower.includes('consider') || lower.includes('practicing') || lower.includes('tailoring')) return 'warning'
  return 'info'
}

export function AIInsightsPage() {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const insightsData = await analyticsService.getInsights()
        setInsights(Array.isArray(insightsData) ? insightsData : [])
      } catch {
        setInsights([])
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-label-sm font-semibold tracking-wide uppercase text-primary">AI Powered</span>
          </div>
          <h1 className="text-headline-lg text-on-surface">AI Insights & Recommendations</h1>
          <p className="text-body-md text-on-surface-variant">
            Personalized, actionable guidance to optimize your job application workflow and interview prep.
          </p>
        </div>
      </div>

      <Card className="mb-xl bg-gradient-to-br from-surface to-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-headline-md text-on-surface font-semibold">How it works</h3>
            <p className="text-body-md text-on-surface-variant mt-1">
              ApplyFlow AI analyzes your job applications, CV match scores, preparation progress, and outcomes to generate custom strategies. Keep updating your application status and matching metrics to get the most accurate advice.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex gap-4 p-md animate-pulse">
                <Skeleton variant="circular" width={24} height={24} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="100%" />
                </div>
              </Card>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <Card className="py-xl text-center">
            <Lightbulb className="h-12 w-12 text-on-surface-variant mx-auto mb-md opacity-50" />
            <h3 className="text-headline-md text-on-surface mb-2">No insights yet</h3>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
              Once you start matching CVs with job descriptions and moving applications through stages (Applied, Interview, etc.), AI recommendations will appear here.
            </p>
          </Card>
        ) : (
          insights.map((message, i) => {
            const severity = insightSeverity(message)
            return (
              <Card
                key={i}
                className={`flex items-start gap-4 p-md transition-all duration-300 border hover:shadow-sm
                  ${
                    severity === 'positive'
                      ? 'bg-emerald-50/30 border-emerald-500/20 dark:bg-emerald-500/5'
                      : severity === 'warning'
                      ? 'bg-amber-50/30 border-amber-500/20 dark:bg-amber-500/5'
                      : 'bg-blue-50/30 border-blue-500/20 dark:bg-blue-500/5'
                  }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0
                    ${
                      severity === 'positive'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : severity === 'warning'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}
                >
                  {severity === 'positive' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : severity === 'warning' ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-label-sm font-semibold tracking-wide uppercase
                        ${
                          severity === 'positive'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : severity === 'warning'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-blue-700 dark:text-blue-400'
                        }`}
                    >
                      {severity === 'positive'
                        ? 'Success Path'
                        : severity === 'warning'
                        ? 'Attention Needed'
                        : 'Info / Tip'}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface leading-relaxed">{message}</p>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </AppLayout>
  )
}
