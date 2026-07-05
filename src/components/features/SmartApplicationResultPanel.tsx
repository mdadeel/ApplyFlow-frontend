import {
  Sparkles,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Building2,
  Loader2,
  Clock,
  RefreshCw,
} from '../../lib/icons'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { Skeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { Badge } from '../ui/Badge'
import { ResumeEditor } from './ResumeEditor'
import { ValidationBadges } from './ValidationBadges'
import type { SmartApplicationResult } from '../../services/smartApplication'

export type ResultTab = 'resume' | 'email' | 'cover-letter'

export type BulkResultItem = SmartApplicationResult | { error: string; company: string; role: string }

export interface SmartApplicationResultPanelProps {
  errorMessage: string | null
  isGenerating: boolean
  result: SmartApplicationResult | null
  resultTab: ResultTab
  onResultTabChange: (tab: ResultTab) => void
  editedResume: string
  onEditedResumeChange: (resume: string) => void
  bulkResults: BulkResultItem[] | null
  elapsedMs: number
  failedAttempts: number
  onRetry: () => void
  onStartOver: () => void
  onExportAll: () => void
  copiedField: string | null
  onCopy: (text: string, field: string) => void
  onResultSelect: (result: SmartApplicationResult) => void
}

const MAX_RETRIES = 3
const TIMEOUT_WARNING_SECONDS = 60

export function SmartApplicationResultPanel({
  errorMessage,
  isGenerating,
  result,
  resultTab,
  onResultTabChange,
  editedResume,
  onEditedResumeChange,
  bulkResults,
  elapsedMs,
  failedAttempts,
  onRetry,
  onStartOver,
  onExportAll,
  copiedField,
  onCopy,
  onResultSelect,
}: SmartApplicationResultPanelProps) {
  // ── Error state ──────────────────────────────────────────
  if (errorMessage && !isGenerating && !result && !bulkResults) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>
          <h3 className="text-headline-sm font-semibold text-on-surface mb-2">
            Generation Failed
          </h3>
          <p className="text-body-md text-on-surface-variant mb-6">
            {errorMessage}
          </p>

          {failedAttempts < MAX_RETRIES ? (
            <div className="space-y-3 text-center">
              <Button onClick={onRetry} className="gap-2" size="lg">
                <RefreshCw className="h-4 w-4" />
                Retry ({MAX_RETRIES - failedAttempts} attempt{MAX_RETRIES - failedAttempts !== 1 ? 's' : ''} left)
              </Button>
              <p className="text-caption text-on-surface-variant">
                The AI model may be under load. Retrying often resolves the issue.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-body-sm text-error font-medium">
                Maximum retry attempts reached. Try again later or with a simpler job description.
              </p>
              <Button variant="secondary" onClick={onStartOver}>
                Start Over
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  // ── Loading state ────────────────────────────────────────
  if (isGenerating && !result) {
    return (
      <Card className="h-full p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-body-md font-medium text-on-surface">
              Generating application...
            </span>
          </div>
          <Badge variant="info" size="sm" className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {Math.floor(elapsedMs / 1000)}s
          </Badge>
        </div>

        {Math.floor(elapsedMs / 1000) > TIMEOUT_WARNING_SECONDS && (
          <div className="flex items-start gap-3 p-3 mb-4 bg-warning/10 border border-warning/20 rounded-lg">
            <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-on-surface">
                Taking longer than expected
              </p>
              <p className="text-caption text-on-surface-variant mt-1">
                The AI model is still processing your request. Some complex job descriptions can
                take a couple of minutes.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 mt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </Card>
    )
  }

  // ── Empty state ──────────────────────────────────────────
  if (!result) {
    return (
      <Card className="h-full flex items-center justify-center p-8">
        <EmptyState
          icon={<Sparkles className="h-12 w-12 text-on-surface-variant" />}
          title="Ready to generate"
          description="Paste a job description and click generate to see your tailored resume, email, and cover letter."
        />
      </Card>
    )
  }

  // ── Result state ─────────────────────────────────────────
  const { output, scores } = result

  return (
    <div className="h-full flex flex-col gap-4">
      <ValidationBadges
        scores={scores}
        hints={output.validationHints}
        atsKeywords={output.analysis.atsKeywords}
      />

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-outline-variant p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {output.analysis.company || 'Unknown Company'}
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {output.analysis.role || 'Unknown Role'} · {output.analysis.matchPercent}% match
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onExportAll} className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="border-b border-outline-variant px-4">
          <Tabs
            tabs={[
              { id: 'resume', label: 'Resume' },
              { id: 'email', label: 'Email' },
              { id: 'cover-letter', label: 'Cover Letter' },
            ]}
            activeTab={resultTab}
            onChange={(id) => onResultTabChange(id as ResultTab)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {resultTab === 'resume' && (
            <ResumeEditor
              markdown={editedResume}
              atsKeywords={output.analysis.atsKeywords}
              onChange={onEditedResumeChange}
            />
          )}

          {resultTab === 'email' && (
            <div className="space-y-4">
              <Card className="p-4 bg-surface-container-low">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm font-medium text-on-surface">Subject</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(output.email.subject, 'subject')}
                    className="gap-1"
                  >
                    {copiedField === 'subject' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedField === 'subject' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-body-md text-on-surface">{output.email.subject}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-medium text-on-surface">Body</span>
                    <Badge variant="info" size="sm">{output.email.tone}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(output.email.body, 'body')}
                    className="gap-1"
                  >
                    {copiedField === 'body' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedField === 'body' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-body-md text-on-surface-variant leading-relaxed">
                  {output.email.body}
                </div>
              </Card>
            </div>
          )}

          {resultTab === 'cover-letter' && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-body-sm font-medium text-on-surface">Cover Letter</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(output.coverLetter, 'cover-letter')}
                  className="gap-1"
                >
                  {copiedField === 'cover-letter' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedField === 'cover-letter' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="whitespace-pre-wrap text-body-md text-on-surface-variant leading-relaxed">
                {output.coverLetter}
              </div>
            </Card>
          )}
        </div>
      </Card>

      {bulkResults && bulkResults.length > 0 && (
        <Card className="p-4">
          <h3 className="text-headline-sm font-semibold text-on-surface mb-3">Bulk Results</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {bulkResults.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-on-surface truncate">
                    {('output' in item ? item.output.analysis.company : item.company) || 'Unknown'}
                  </p>
                  <p className="text-caption text-on-surface-variant truncate">
                    {('output' in item ? item.output.analysis.role : item.role) || 'Unknown'}
                  </p>
                </div>
                {'output' in item ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.scores.overall >= 80 ? 'success' : 'warning'} size="sm">
                      {item.scores.overall}%
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResultSelect(item)}
                    >
                      View
                    </Button>
                  </div>
                ) : (
                  <Badge variant="error" size="sm" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
