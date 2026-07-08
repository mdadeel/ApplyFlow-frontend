import { useState } from 'react'
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
  ChevronDown,
  ChevronUp,
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
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <h3 className="text-heading-3 text-text-primary mb-2">
            Generation Failed
          </h3>
          <p className="text-body text-text-secondary mb-6">
            {errorMessage}
          </p>

          {failedAttempts < MAX_RETRIES ? (
            <div className="space-y-3 text-center">
              <Button onClick={onRetry} className="gap-2" size="lg">
                <RefreshCw className="h-4 w-4" />
                Retry ({MAX_RETRIES - failedAttempts} attempt{MAX_RETRIES - failedAttempts !== 1 ? 's' : ''} left)
              </Button>
              <p className="text-caption text-text-secondary">
                The AI model may be under load. Retrying often resolves the issue.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-body-sm text-danger font-medium">
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
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-body font-medium text-text-primary">
              Generating application...
            </span>
          </div>
          <Badge variant="default" className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {Math.floor(elapsedMs / 1000)}s
          </Badge>
        </div>

        {Math.floor(elapsedMs / 1000) > TIMEOUT_WARNING_SECONDS && (
          <div className="flex items-start gap-3 p-3 mb-4 bg-warning/10 border border-warning/20 rounded-lg">
            <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-text-primary">
                Taking longer than expected
              </p>
              <p className="text-caption text-text-secondary mt-1">
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
          icon={<Sparkles className="h-12 w-12 text-text-tertiary" />}
          title="Ready to generate"
          description="Paste a job description and click generate to see your tailored resume, email, and cover letter."
        />
      </Card>
    )
  }

  // ── Result state ─────────────────────────────────────────
  const { output, scores } = result
  const [showValidation, setShowValidation] = useState(false)
  const [showBulk, setShowBulk] = useState(false)

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Unified Header */}
      <div className="border-b border-border p-4 flex flex-wrap items-center justify-between gap-3 bg-surface-secondary">
        <div>
          <h2 className="text-heading-3 text-text-primary flex items-center gap-2 font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            {output.analysis.company || 'Unknown Company'}
          </h2>
          <p className="text-body-sm text-text-secondary mt-0.5 font-medium">
            {output.analysis.role || 'Unknown Role'} · <span className="text-primary">{output.analysis.matchPercent}% match</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bulkResults && bulkResults.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowBulk(!showBulk)
                setShowValidation(false)
              }}
              className="gap-1"
            >
              Bulk ({bulkResults.length})
              {showBulk ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowValidation(!showValidation)
              setShowBulk(false)
            }}
            className="gap-1"
          >
            Validation
            {showValidation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="secondary" size="sm" onClick={onExportAll} className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Collapsible Validation Section */}
      {showValidation && (
        <div className="border-b border-border bg-neutral-50 p-4 transition-all duration-200">
          <ValidationBadges
            scores={scores}
            hints={output.validationHints}
            atsKeywords={output.analysis.atsKeywords}
          />
        </div>
      )}

      {/* Collapsible Bulk Results Section */}
      {showBulk && bulkResults && bulkResults.length > 0 && (
        <div className="border-b border-border bg-neutral-50 p-4 max-h-60 overflow-y-auto transition-all duration-200">
          <h4 className="text-body-sm font-semibold text-text-primary mb-2">Generated Applications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {bulkResults.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border border-neutral-200 bg-white rounded-md hover:border-primary transition-colors cursor-pointer"
                onClick={() => {
                  if ('output' in item) {
                    onResultSelect(item)
                    setShowBulk(false)
                  }
                }}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-body-sm font-medium text-text-primary truncate">
                    {('output' in item ? item.output.analysis.company : item.company) || 'Unknown'}
                  </p>
                  <p className="text-caption text-text-secondary truncate">
                    {('output' in item ? item.output.analysis.role : item.role) || 'Unknown'}
                  </p>
                </div>
                {'output' in item ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={item.scores.overall >= 80 ? 'success' : 'warning'}>
                      {item.scores.overall}%
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="danger" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div className="border-b border-border px-4 bg-white">
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

      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {resultTab === 'resume' && (
          <ResumeEditor
            markdown={editedResume}
            atsKeywords={output.analysis.atsKeywords}
            onChange={onEditedResumeChange}
          />
        )}

        {resultTab === 'email' && (
          <div className="space-y-4">
            <Card className="p-4 bg-surface-secondary">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-medium text-text-primary">Subject</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(output.email.subject, 'subject')}
                  className="gap-1 animate-none hover:text-white"
                >
                  {copiedField === 'subject' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedField === 'subject' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-body text-text-primary font-medium">{output.email.subject}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-body-sm font-medium text-text-primary">Body</span>
                  <Badge variant="default">{output.email.tone}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(output.email.body, 'body')}
                  className="gap-1 animate-none hover:text-white"
                >
                  {copiedField === 'body' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedField === 'body' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="whitespace-pre-wrap text-body text-text-secondary leading-relaxed font-sans">
                {output.email.body}
              </div>
            </Card>
          </div>
        )}

        {resultTab === 'cover-letter' && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-medium text-text-primary">Cover Letter</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(output.coverLetter, 'cover-letter')}
                className="gap-1 animate-none hover:text-white"
              >
                {copiedField === 'cover-letter' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedField === 'cover-letter' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="whitespace-pre-wrap text-body text-text-secondary leading-relaxed font-sans">
              {output.coverLetter}
            </div>
          </Card>
        )}
      </div>
    </Card>
  )
}
