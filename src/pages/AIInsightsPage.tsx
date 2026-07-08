import { useState, useEffect } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { analyticsService } from '../services/analytics'
import { Lightbulb, AlertTriangle, Sparkles, Award, TrendingUp } from '../lib/icons'

interface InsightTypeConfig {
  icon: any
  label: string
  bgClass: string
  borderClass: string
  textClass: string
  iconBgClass: string
  iconTextClass: string
}

function getInsightConfig(message: string): InsightTypeConfig {
  const lower = message.toLowerCase()
  
  if (lower.includes('offer') || lower.includes('great progress') || lower.includes('success') || lower.includes('achieved')) {
    return {
      icon: Award,
      label: 'Achievement',
      bgClass: 'bg-emerald-50/40',
      borderClass: 'border-emerald-500/20',
      textClass: 'text-emerald-800',
      iconBgClass: 'bg-emerald-100',
      iconTextClass: 'text-emerald-700',
    }
  }
  
  if (lower.includes('low match') || lower.includes('missing') || lower.includes('attention') || lower.includes('critical') || lower.includes('improve')) {
    return {
      icon: AlertTriangle,
      label: 'Attention Required',
      bgClass: 'bg-red-50/40',
      borderClass: 'border-red-500/20',
      textClass: 'text-red-800',
      iconBgClass: 'bg-red-100',
      iconTextClass: 'text-red-700',
    }
  }

  if (lower.includes('predict') || lower.includes('likely') || lower.includes('chance') || lower.includes('outlook') || lower.includes('probability')) {
    return {
      icon: TrendingUp,
      label: 'AI Prediction',
      bgClass: 'bg-indigo-50/40',
      borderClass: 'border-indigo-500/20',
      textClass: 'text-indigo-800',
      iconBgClass: 'bg-indigo-100',
      iconTextClass: 'text-indigo-700',
    }
  }

  if (lower.includes('consider') || lower.includes('practicing') || lower.includes('tailoring') || lower.includes('try') || lower.includes('recommend')) {
    return {
      icon: Sparkles,
      label: 'AI Suggestion',
      bgClass: 'bg-violet-50/40',
      borderClass: 'border-violet-500/20',
      textClass: 'text-violet-800',
      iconBgClass: 'bg-violet-100',
      iconTextClass: 'text-violet-700',
    }
  }

  return {
    icon: Lightbulb,
    label: 'Insight Tip',
    bgClass: 'bg-blue-50/40',
    borderClass: 'border-blue-500/20',
    textClass: 'text-blue-800',
    iconBgClass: 'bg-blue-100',
    iconTextClass: 'text-blue-700',
  }
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
            <span className="text-label font-semibold tracking-wide uppercase text-primary">AI Powered</span>
          </div>
          <h1 className="text-display text-text-primary">AI Insights & Recommendations</h1>
          <p className="text-body text-text-secondary">
            Personalized, actionable guidance to optimize your job application workflow and interview prep.
          </p>
        </div>
      </div>

      <Card className="mb-xl bg-gradient-to-br from-surface-secondary to-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-heading-2 text-text-primary font-semibold">How it works</h3>
            <p className="text-body text-text-secondary mt-1">
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
            <Lightbulb className="h-12 w-12 text-text-tertiary mx-auto mb-md opacity-50" />
            <h3 className="text-heading-2 text-text-primary mb-2">No insights yet</h3>
            <p className="text-body text-text-secondary max-w-md mx-auto">
              Once you start matching CVs with job descriptions and moving applications through stages (Applied, Interview, etc.), AI recommendations will appear here.
            </p>
          </Card>
        ) : (
          insights.map((message, i) => {
            const config = getInsightConfig(message)
            const Icon = config.icon
            return (
              <Card
                key={i}
                className={`flex items-start gap-5 p-6 transition-all duration-300 border ${config.bgClass} ${config.borderClass}`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${config.iconBgClass} ${config.iconTextClass} shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-caption font-bold tracking-wider uppercase ${config.textClass}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-body-sm text-text-primary leading-relaxed">{message}</p>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </AppLayout>
  )
}
