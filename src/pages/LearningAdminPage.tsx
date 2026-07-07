import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/layout/useToast'
import {
  getSuggestions,
  refreshSuggestions,
  resetSuggestions,
  getFeedback,
  getLearningStatus,
  type SuggestionsResponse,
  type RefreshResponse,
  type FeedbackResponse,
  type StatusResponse,
} from '../services/learning'
import {
  BrainCircuit,
  RefreshCw,
  RotateCcw,
  BarChart3,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Zap,
  Sparkles,
  EyeOff,
  ListChecks,
} from '../lib/icons'

type AdminTab = 'status' | 'suggestions' | 'feedback'

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'status', label: 'Status' },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'feedback', label: 'Feedback History' },
]

// ── Helpers ─────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString()
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

function severityColor(severity: string): 'default' | 'warning' | 'success' | 'danger' {
  switch (severity) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'default'
    default: return 'default'
  }
}

// ── Stat Card ───────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    info: 'bg-blue-50 text-blue-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-surface-secondary border border-border p-md rounded-xl flex items-start gap-3">
      <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.primary} shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-label text-text-tertiary">{title}</p>
        <p className="text-heading-3 font-semibold text-text-primary mt-0.5">{value}</p>
        {subtitle && (
          <p className="text-label text-text-tertiary mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

// ── Status Tab ──────────────────────────────────────────────────────

function StatusTabContent({ status }: { status: StatusResponse | null }) {
  if (!status) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height={88} />
        ))}
      </div>
    )
  }

  const { patterns, suggestions, feedback, metrics, analytics } = status

  return (
    <div className="space-y-xl">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        <StatCard
          title="Patterns Detected"
          value={patterns.total}
          subtitle={patterns.total > 0 ? `Last check: ${formatTimestamp(patterns.generatedAt)}` : 'No patterns yet'}
          icon={BrainCircuit}
          color="primary"
        />
        <StatCard
          title="Active Suggestions"
          value={suggestions.count}
          subtitle={suggestions.active ? 'Auto-tuning enabled' : 'No suggestions active'}
          icon={Lightbulb}
          color={suggestions.active ? 'warning' : 'info'}
        />
        <StatCard
          title="Total Pipeline Runs"
          value={metrics.totalRuns}
          subtitle="Across all stages"
          icon={BarChart3}
          color="info"
        />
        <StatCard
          title="Feedback Events"
          value={feedback.total}
          subtitle={`${feedback.bySource['export-edit'] || 0} edits, ${feedback.bySource['explicit-rating'] || 0} ratings`}
          icon={ListChecks}
          color="success"
        />
      </div>

      {/* Patterns breakdown */}
      <Card>
        <h3 className="text-heading-2 text-text-primary mb-md flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Pattern Detection Results
        </h3>
        {patterns.total === 0 ? (
          <div className="py-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-secondary mb-3">
              <Sparkles className="h-6 w-6 text-text-tertiary" />
            </div>
            <p className="text-body text-text-secondary">No patterns detected yet.</p>
            <p className="text-label text-text-tertiary mt-1">
              Patterns appear after several pipeline runs with consistent metrics.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(patterns.byType).map(([type, count]) => {
              const severity = count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low'
              return (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary">
                  <div className="flex items-center gap-3">
                    <Badge variant={severityColor(severity)}>
                      {severity}
                    </Badge>
                    <span className="text-body text-text-primary font-medium">
                      {type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                  <span className="text-label text-text-tertiary">{count}×</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Metrics by stage */}
      {Object.keys(metrics.byStage).length > 0 && (
        <Card>
          <h3 className="text-heading-2 text-text-primary mb-md flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Pipeline Metrics by Stage
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-label text-text-tertiary border-b border-border">
                  <th className="pb-2 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Runs</th>
                  <th className="pb-2 font-medium">Avg Latency</th>
                  <th className="pb-2 font-medium">Pass Rate</th>
                  <th className="pb-2 font-medium">Avg Retries</th>
                  <th className="pb-2 font-medium">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(metrics.byStage).map(([stage, m]) => (
                  <tr key={stage} className="text-body-sm text-text-primary hover:bg-surface-secondary transition-colors">
                    <td className="py-2.5 font-medium capitalize">{stage.replace(/_/g, ' ')}</td>
                    <td className="py-2.5">{m.totalRuns}</td>
                    <td className="py-2.5">{formatDuration(m.avgLatency)}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 ${m.passCount / m.totalRuns >= 0.8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {Math.round((m.passCount / m.totalRuns) * 100)}%
                      </span>
                    </td>
                    <td className="py-2.5">{m.avgRetryCount}</td>
                    <td className="py-2.5">{m.avgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Analytics summary */}
      <Card>
        <h3 className="text-heading-2 text-text-primary mb-md flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Analytics Event Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(analytics).map(([type, count]) => (
            <div key={type} className="text-center p-3 rounded-lg bg-surface-secondary">
              <p className="text-heading-3 font-semibold text-text-primary">{count}</p>
              <p className="text-label text-text-tertiary mt-1">
                {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ── Suggestions Tab ─────────────────────────────────────────────────

function SuggestionsTabContent({
  suggestions,
  loading,
  onRefresh,
  onReset,
  refreshing,
}: {
  suggestions: SuggestionsResponse | null
  loading: boolean
  onRefresh: () => void
  onReset: () => void
  refreshing: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height={80} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-md">
      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-body text-text-secondary">
            {suggestions?.active
              ? `${suggestions.count} active auto-tuning suggestion${suggestions.count !== 1 ? 's' : ''}`
              : 'No active suggestions. Run the pipeline to generate patterns.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            loading={refreshing}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="h-4 w-4" />}
            disabled={!suggestions?.active}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Suggestion cards */}
      {suggestions && suggestions.suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.suggestions.map((s, i) => (
            <div
              key={`${s.stage}-${s.field}-${i}`}
              className="rounded-lg border border-border p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="capitalize">
                      {s.stage.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="default">
                      {s.field.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                    <Badge variant={severityColor(s.pattern === 'hallucination-hotspot' || s.pattern === 'rejection-loop' ? 'high' : 'medium')}>
                      {s.pattern.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-body text-text-primary font-medium">
                    {s.field === 'maxRetries' ? 'Increase retry limit' : 'Adjust score threshold'} for {s.stage.replace(/_/g, ' ')}
                  </p>
                  <p className="text-label text-text-tertiary mt-1">{s.reason}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-label text-text-tertiary">Current</p>
                    <p className="text-label font-semibold text-text-primary">{s.currentValue}</p>
                  </div>
                  <div className="text-text-tertiary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-label text-text-tertiary">Suggested</p>
                    <p className="text-label font-semibold text-primary">{s.suggestedValue}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-secondary mb-3">
            <Sparkles className="h-6 w-6 text-text-tertiary" />
          </div>
          <p className="text-body text-text-secondary">No suggestions available.</p>
          <p className="text-label text-text-tertiary mt-1">
            Suggestions are generated automatically based on pipeline patterns.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Feedback Tab ────────────────────────────────────────────────────

const SOURCE_OPTIONS = [
  { value: '', label: 'All sources' },
  { value: 'export-edit', label: 'Export Edits' },
  { value: 'regeneration', label: 'Regenerations' },
  { value: 'validation-override', label: 'Validation Overrides' },
  { value: 'explicit-rating', label: 'Ratings' },
] as const

function FeedbackTabContent({ loading }: { loading: boolean }) {
  const [sourceFilter, setSourceFilter] = useState('')
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  // Load feedback when filter changes or component mounts
  useEffect(() => {
    let cancelled = false
    async function load() {
      setFeedbackLoading(true)
      try {
        const data = await getFeedback(sourceFilter || undefined, 50)
        if (!cancelled) setFeedbackData(data)
      } catch {
        if (!cancelled) setFeedbackData(null)
      } finally {
        if (!cancelled) setFeedbackLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [sourceFilter])

  const isLoading = loading || feedbackLoading
  const events = feedbackData?.events ?? []

  return (
    <div className="space-y-md">
      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSourceFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-label font-medium transition-colors ${
                sourceFilter === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-tertiary hover:bg-surface-secondary/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {feedbackData && (
          <span className="text-label text-text-tertiary ml-auto">
            {feedbackData.total} total events, showing {feedbackData.displayed}
          </span>
        )}
      </div>

      {/* Event list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={64} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="py-xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-secondary mb-3">
            <EyeOff className="h-6 w-6 text-text-tertiary" />
          </div>
          <p className="text-body text-text-secondary">No feedback events found.</p>
          <p className="text-label text-text-tertiary mt-1">
            Feedback is collected when you edit exports, regenerate sections, or rate outputs.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {events.map((event, i) => (
            <div
              key={`${event.timestamp}-${i}`}
              className="px-4 py-3 hover:bg-surface-secondary transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={sourceBadge(event.source)}>
                      {event.source.replace(/-/g, ' ')}
                    </Badge>
                    {event.section && (
                      <Badge variant="default">
                        {event.section}
                      </Badge>
                    )}
                    {event.rating && (
                      <Badge variant={event.rating === 'up' ? 'success' : 'danger'}>
                        {event.rating === 'up' ? '👍' : '👎'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-body-sm text-text-primary">
                    <span className="font-medium capitalize">{event.phase}</span>
                    {event.rating
                      ? ` — ${event.rating === 'up' ? 'Positive' : 'Negative'} rating`
                      : event.hasEdited
                      ? ' — User-modified content'
                      : ''}
                  </p>
                  {event.score > 0 && (
                    <p className="text-label text-text-tertiary mt-0.5">
                      Score: {event.score}
                    </p>
                  )}
                  {event.diff && (
                    <details className="mt-1">
                      <summary className="text-label text-primary cursor-pointer hover:underline">
                        View changes
                      </summary>
                      <pre className="mt-1 p-2 rounded bg-surface-secondary text-label text-text-tertiary overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap font-mono">
                        {event.diff}
                      </pre>
                    </details>
                  )}
                </div>
                <time className="text-label text-text-tertiary shrink-0 whitespace-nowrap">
                  {formatTimestamp(event.timestamp)}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function sourceBadge(source: string): 'default' | 'success' | 'warning' {
  switch (source) {
    case 'explicit-rating': return 'success'
    case 'export-edit': return 'default'
    case 'regeneration': return 'warning'
    case 'validation-override': return 'default'
    default: return 'default'
  }
}

// ── Main Page ───────────────────────────────────────────────────────

export function LearningAdminPage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<AdminTab>('status')

  // Data state
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<RefreshResponse | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [statusData, suggestionsData] = await Promise.all([
        getLearningStatus(),
        getSuggestions(),
      ])
      setStatus(statusData)
      setSuggestions(suggestionsData)
    } catch {
      toast.showToast('Failed to load learning system data', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load data on mount
  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Auto-refresh suggestions when switching to that tab
  // (but only if we have stale or no data)
  useEffect(() => {
    if (activeTab === 'suggestions' && !suggestions && !loading) {
      loadAll()
    }
  }, [activeTab, suggestions, loading, loadAll])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const result = await refreshSuggestions()
      setRefreshResult(result)
      // Reload suggestions from cache
      const freshSuggestions = await getSuggestions()
      setSuggestions(freshSuggestions)
      toast.showToast(
        `Pattern detection complete — ${result.suggestionsGenerated} suggestion${result.suggestionsGenerated !== 1 ? 's' : ''} generated`,
        'success',
      )
    } catch {
      toast.showToast('Failed to refresh suggestions', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleReset() {
    try {
      await resetSuggestions()
      setSuggestions({ count: 0, lastUpdated: null, active: false, suggestions: [] })
      setRefreshResult(null)
      toast.showToast('Suggestions reset successfully', 'success')
    } catch {
      toast.showToast('Failed to reset suggestions', 'error')
    }
  }

  const tabContent: Record<AdminTab, () => React.ReactNode> = {
    status: () => <StatusTabContent status={status} />,
    suggestions: () => (
      <SuggestionsTabContent
        suggestions={suggestions}
        loading={loading}
        onRefresh={handleRefresh}
        onReset={handleReset}
        refreshing={refreshing}
      />
    ),
    feedback: () => <FeedbackTabContent loading={loading} />,
  }

  return (
    <AppLayout>
      <div className="space-y-md">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-heading-1 text-text-primary">Learning System</h1>
            <p className="text-body text-text-secondary">
              Monitor auto-tuning, pattern detection, and feedback for the generation engine.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAll}
            loading={loading}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh All
          </Button>
        </div>

        {/* Refresh result banner */}
        {refreshResult && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-body-md font-medium text-emerald-800">Pattern detection refreshed</p>
              <p className="text-label-sm text-emerald-700 mt-0.5">
                Found {refreshResult.patternsFound} pattern{refreshResult.patternsFound !== 1 ? 's' : ''},
                generated {refreshResult.suggestionsGenerated} suggestion{refreshResult.suggestionsGenerated !== 1 ? 's' : ''},
                applied {refreshResult.changesApplied} change{refreshResult.changesApplied !== 1 ? 's' : ''}.
              </p>
              {refreshResult.report.patterns.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {refreshResult.report.patterns.map((p, i) => (
                    <Badge key={i} variant={severityColor(p.severity)}>
                      {p.type.replace(/-/g, ' ')} — {p.severity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setRefreshResult(null)}
              aria-label="Dismiss"
              className="text-emerald-500 hover:text-emerald-700 shrink-0"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-surface-secondary border border-border rounded-xl overflow-hidden">
          <div className="px-md">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as AdminTab)}
            />
          </div>
          <div className="p-md min-h-[400px]">
            {tabContent[activeTab]()}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
