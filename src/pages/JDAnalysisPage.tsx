import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { applicationsService } from '../services/applications'
import { AppLayout } from '../components/layout/AppLayout'
import { SplitPanel } from '../components/layout/SplitPanel'
import { Section } from '../components/layout/Section'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { JDSummary } from '../components/features/JDSummary'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { jdService } from '../services/jd'
import { smartApplicationService } from '../services/smartApplication'
import { useToast } from '../components/layout/useToast'
import type { JDAnalysis } from '../types'
import {
  FileText,
  Sparkles,
  ScrollText,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
} from '../lib/icons'

const SAMPLE_JD = `We are looking for a Senior Frontend Engineer to join our team.

Requirements:
- 5+ years of experience in frontend development
- Strong proficiency in React.js and TypeScript
- Experience with state management (Redux, Context API)
- Familiarity with Tailwind CSS and modern CSS
- Understanding of responsive design principles
- Experience with testing frameworks (Jest, React Testing Library)

Nice to have:
- Experience with Next.js
- Knowledge of Node.js/Express
- GraphQL experience

Benefits:
- Remote-first culture
- Competitive salary
- Equity package`

// ── Types ──────────────────────────────────────────────

interface JDEntry {
  id: string
  company: string
  role: string
  jdText: string
}

type BulkResult =
  | { kind: 'success'; company: string; role: string; matchPercent: number; applicationId: string }
  | { kind: 'error'; company: string; role: string; error: string }

type JDMode = 'single' | 'multiple' | 'csv'

// ── CSV parsing helper (embedded per spec) ─────────────

/**
 * Parse a CSV string into rows of objects keyed by header column.
 * Supports quoted fields (with embedded commas/newlines/escaped quotes).
 * Header lookup is case-insensitive; accepts both `jd_text` and `job_description`.
 */
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const ch = text.charAt(i)
    if (inQuotes) {
      if (ch === '"') {
        if (text.charAt(i + 1) === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      cur.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\n' || ch === '\r') {
      cur.push(field)
      field = ''
      // Skip empty trailing lines
      if (cur.some((c) => c.trim() !== '')) rows.push(cur)
      cur = []
      // Handle CRLF
      if (ch === '\r' && text.charAt(i + 1) === '\n') i += 2
      else i++
      continue
    }
    field += ch
    i++
  }
  // Last field/row
  if (field !== '' || cur.length > 0) {
    cur.push(field)
    if (cur.some((c) => c.trim() !== '')) rows.push(cur)
  }
  if (rows.length === 0) return []
  const header = rows[0].map((h) => h.trim())
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((h, idx) => {
      if (h === '__proto__' || h === 'constructor' || h === 'prototype') return
      obj[h] = (r[idx] ?? '').trim()
    })
    return obj
  })
}

function pickColumn(row: Record<string, string>, ...keys: string[]): string {
  const lower: Record<string, string> = {}
  for (const k of Object.keys(row)) {
    const lowerKey = k.toLowerCase()
    if (lowerKey === '__proto__' || lowerKey === 'constructor' || lowerKey === 'prototype') continue
    lower[lowerKey] = row[k]
  }
  for (const k of keys) {
    const v = lower[k.toLowerCase()]
    if (v !== undefined && v !== '') return v
  }
  return ''
}

function makeEntryId(): string {
  return `jd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ── Component ──────────────────────────────────────────

export function JDAnalysisPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appId = searchParams.get('application')
  const toast = useToast()

  // Target application context
  const [targetApp, setTargetApp] = useState<{ company: string; role: string } | null>(null)

  // Mode / tab
  const [mode, setMode] = useState<JDMode>('single')

  // Single-JD state (existing behavior)
  const [jdText, setJdText] = useState('')
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Multiple-JDs state
  const [bulkItems, setBulkItems] = useState<JDEntry[]>([
    { id: makeEntryId(), company: '', role: '', jdText: '' },
  ])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null)

  // CSV state
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const [csvEntries, setCsvEntries] = useState<JDEntry[]>([])
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvDragActive, setCsvDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [recentSearchValue, setRecentSearchValue] = useState('')

  const recentAnalysesQuery = useQuery({
    queryKey: ['jd-analyses', 'recent'],
    queryFn: () => jdService.getRecentAnalyses(50),
    staleTime: 30 * 1000,
  })
  const recentAnalysesRaw = recentAnalysesQuery.data ?? []

  const recentAnalyses = recentAnalysesRaw.filter((item: any) => {
    if (!recentSearchValue.trim()) return true
    const q = recentSearchValue.toLowerCase()
    const company = String(item.company ?? '').toLowerCase()
    const role = String(item.role ?? '').toLowerCase()
    return company.includes(q) || role.includes(q)
  })

  // ── Load Application Context ───────────────────────────
  const linkedAppQuery = useQuery({
    queryKey: ['application', appId],
    queryFn: () =>
      appId ? applicationsService.getApplication(appId) : Promise.resolve(null),
    enabled: Boolean(appId),
    staleTime: 30 * 1000,
  })
  const linkedApp = linkedAppQuery.data

  useEffect(() => {
    if (!linkedApp) return
    setTargetApp({ company: linkedApp.company, role: linkedApp.role })
    setJdText((current) => (current ? current : linkedApp.jdText ?? current))
  }, [linkedApp])

  // ── Handlers: single JD (unchanged) ───────────────────

  async function handleAnalyze() {
    if (!jdText.trim()) {
      toast.showToast('Please paste a job description first', 'warning')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await jdService.analyzeJD(jdText)
      setAnalysis(result)
      
      // If we are linked to a specific application, update it with analysis reference and scores
      if (appId) {
        try {
          await applicationsService.updateApplication(appId, {
            jdText,
            jdAnalysisId: result._id,
            scores: {
              match: result.matchScore || 0,
              ats: result.matchScore || 0,
              overall: result.matchScore || 0
            }
          })
          toast.showToast('Application scores updated', 'success')
        } catch (updateErr) {
          console.error('Failed to update application with scores', updateErr)
        }
      }

      toast.showToast('JD analyzed successfully', 'success')
    } catch {
      setError('Failed to analyze the job description. The server may be unavailable. Please try again.')
      toast.showToast('Failed to analyze JD', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleSampleJD() {
    setJdText(SAMPLE_JD)
  }

  // ── Handlers: multiple JDs ────────────────────────────

  function updateEntry(id: string, patch: Partial<JDEntry>) {
    setBulkItems((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }
  function removeEntry(id: string) {
    setBulkItems((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev))
  }
  function addEntry() {
    setBulkItems((prev) => [
      ...prev,
      { id: makeEntryId(), company: '', role: '', jdText: '' },
    ])
  }

  const validEntries = bulkItems.filter(
    (e) => e.jdText.trim().length > 0 && e.company.trim().length > 0 && e.role.trim().length > 0,
  )

  async function handleAnalyzeAll() {
    if (validEntries.length === 0) {
      toast.showToast('Please fill in at least one complete JD entry', 'warning')
      return
    }
    setBulkLoading(true)
    setBulkResults(null)
    try {
      const res = await smartApplicationService.bulkCreate({
        jds: validEntries.map((e) => ({
          company: e.company.trim(),
          role: e.role.trim(),
          jdText: e.jdText.trim(),
        })),
      })
      const mapped: BulkResult[] = res.results.map((r) => {
        if ('error' in r) {
          return { kind: 'error', company: r.company, role: r.role, error: r.error }
        }
        return {
          kind: 'success',
          company: r.output.analysis.company,
          role: r.output.analysis.role,
          matchPercent: r.output.analysis.matchPercent,
          applicationId: r.applicationId,
        }
      })
      setBulkResults(mapped)
      const successCount = mapped.filter((r) => r.kind === 'success').length
      toast.showToast(
        `Analyzed ${successCount}/${mapped.length} JD${mapped.length === 1 ? '' : 's'}`,
        successCount === mapped.length ? 'success' : 'warning',
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze JDs'
      toast.showToast(msg, 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  // ── Handlers: CSV ─────────────────────────────────────

  function processCSVFile(file: File) {
    setCsvError(null)
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setCsvError('Please upload a .csv file')
      return
    }
    void file
      .text()
      .then((text) => {
        const rows = parseCSV(text)
        if (rows.length === 0) {
          setCsvError('CSV appears to be empty')
          setCsvEntries([])
          return
        }
        const parsed: JDEntry[] = rows
          .map((row) => {
            const company = pickColumn(row, 'company', 'Company')
            const role = pickColumn(row, 'role', 'position', 'Job Title')
            const jdText = pickColumn(row, 'jd_text', 'job_description', 'jd', 'description')
            return {
              id: makeEntryId(),
              company,
              role,
              jdText,
            }
          })
          .filter((e) => e.company || e.role || e.jdText)
        if (parsed.length === 0) {
          setCsvError('No valid rows found. Required columns: company, role, jd_text')
          return
        }
        // Validate required columns
        const missing = parsed.every(
          (e) => !e.company || !e.role || !e.jdText,
        )
        if (missing) {
          setCsvError(
            'CSV must include columns: company, role, jd_text (or job_description)',
          )
          return
        }
        setCsvFileName(file.name)
        setCsvEntries(parsed)
        toast.showToast(`Parsed ${parsed.length} row${parsed.length === 1 ? '' : 's'}`, 'success')
      })
      .catch(() => {
        setCsvError('Failed to read file')
      })
  }

  const handleCSVFile = useCallback((file: File | null) => {
    if (!file) return
    processCSVFile(file)
  }, [])

  function handleCsvDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setCsvDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleCSVFile(file)
  }

  async function handleAnalyzeCSV() {
    const validCsv = csvEntries.filter(
      (e) => e.company.trim() && e.role.trim() && e.jdText.trim(),
    )
    if (validCsv.length === 0) {
      toast.showToast('No valid rows to analyze', 'warning')
      return
    }
    setBulkLoading(true)
    setBulkResults(null)
    try {
      const res = await smartApplicationService.bulkCreate({
        jds: validCsv.map((e) => ({
          company: e.company.trim(),
          role: e.role.trim(),
          jdText: e.jdText.trim(),
        })),
      })
      const mapped: BulkResult[] = res.results.map((r) => {
        if ('error' in r) {
          return { kind: 'error', company: r.company, role: r.role, error: r.error }
        }
        return {
          kind: 'success',
          company: r.output.analysis.company,
          role: r.output.analysis.role,
          matchPercent: r.output.analysis.matchPercent,
          applicationId: r.applicationId,
        }
      })
      setBulkResults(mapped)
      const successCount = mapped.filter((r) => r.kind === 'success').length
      toast.showToast(
        `Analyzed ${successCount}/${mapped.length} JD${mapped.length === 1 ? '' : 's'}`,
        successCount === mapped.length ? 'success' : 'warning',
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze JDs'
      toast.showToast(msg, 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  function clearCSV() {
    setCsvFileName(null)
    setCsvEntries([])
    setCsvError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Render helpers ────────────────────────────────────

  function renderMultipleTab() {
    return (
      <div className="space-y-4">
        <Section
          title="Add Job Descriptions"
          description="Enter one or more JDs to analyze them in bulk."
          titleClassName="text-body font-semibold"
          descriptionClassName="text-caption"
        >
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {bulkItems.map((entry, idx) => (
              <div key={entry.id} className="p-3 border border-neutral-200 bg-white rounded-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-body-sm font-semibold text-text-primary">
                    JD #{idx + 1}
                  </p>
                  {bulkItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="inline-flex items-center gap-0.5 text-caption text-red-600 hover:text-red-700 transition-colors"
                      aria-label={`Remove JD ${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Company"
                    value={entry.company}
                    onChange={(e) => updateEntry(entry.id, { company: e.target.value })}
                  />
                  <Input
                    placeholder="Role"
                    value={entry.role}
                    onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Paste the full job description here..."
                  value={entry.jdText}
                  onChange={(e) => updateEntry(entry.id, { jdText: e.target.value })}
                  className="w-full h-24 p-2 bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-md text-body-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-150 resize-none font-sans"
                />
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={addEntry}
            disabled={bulkLoading}
            className="w-full border border-dashed border-neutral-300 hover:bg-neutral-50 text-body-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add another JD
          </Button>
        </Section>

        <div className="flex gap-2">
          <Button
            onClick={handleAnalyzeAll}
            loading={bulkLoading}
            disabled={validEntries.length === 0}
            className="flex-1"
            icon={<Sparkles className="h-4 w-4" />}
          >
            Analyze all ({validEntries.length})
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setBulkItems([{ id: makeEntryId(), company: '', role: '', jdText: '' }])
              setBulkResults(null)
            }}
            disabled={bulkLoading}
          >
            Reset
          </Button>
        </div>
      </div>
    )
  }

  function renderCSVTab() {
    return (
      <div className="space-y-4">
        <Section
          title="Upload CSV"
          description="CSV columns must include: company, role, jd_text."
          titleClassName="text-body font-semibold"
          descriptionClassName="text-caption"
        >
          {!csvFileName ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setCsvDragActive(true)
              }}
              onDragLeave={() => setCsvDragActive(false)}
              onDrop={handleCsvDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
              }}
              className={`flex flex-col items-center justify-center gap-1.5 p-6 rounded-md border border-dashed cursor-pointer transition-all duration-150 ${
                csvDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-300 bg-white hover:border-primary/50'
              }`}
            >
              <Upload className="h-8 w-8 text-text-tertiary" />
              <p className="text-body-sm font-semibold text-text-primary">
                Drag & drop a CSV file here
              </p>
              <p className="text-caption text-text-secondary">
                or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => handleCSVFile(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="rounded-md border border-neutral-200 bg-white p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-text-tertiary" />
                  <span className="text-body-sm font-semibold text-text-primary truncate max-w-[150px]">
                    {csvFileName}
                  </span>
                  <span className="text-caption text-text-secondary">
                    ({csvEntries.length} rows)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearCSV}
                  className="inline-flex items-center gap-0.5 text-caption text-red-600 hover:text-red-700 transition-colors"
                  aria-label="Remove CSV"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
              <div className="overflow-x-auto max-h-48 overflow-y-auto rounded border border-neutral-200">
                <table className="w-full text-caption border-collapse">
                  <thead className="bg-neutral-50 sticky top-0 border-b border-neutral-200">
                    <tr>
                      <th className="text-left px-2 py-1.5 font-semibold text-text-secondary">#</th>
                      <th className="text-left px-2 py-1.5 font-semibold text-text-secondary">Company</th>
                      <th className="text-left px-2 py-1.5 font-semibold text-text-secondary">Role</th>
                      <th className="text-left px-2 py-1.5 font-semibold text-text-secondary">JD Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {csvEntries.map((e, idx) => (
                      <tr key={e.id} className="hover:bg-neutral-50/50">
                        <td className="px-2 py-1.5 text-text-secondary">{idx + 1}</td>
                        <td className="px-2 py-1.5 text-text-primary font-medium">{e.company || '—'}</td>
                        <td className="px-2 py-1.5 text-text-primary">{e.role || '—'}</td>
                        <td className="px-2 py-1.5 text-text-secondary truncate max-w-[120px]">
                          {e.jdText ? e.jdText.slice(0, 50) + (e.jdText.length > 50 ? '…' : '') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {csvError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-caption text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{csvError}</span>
            </div>
          )}
        </Section>

        <div className="flex gap-2">
          <Button
            onClick={handleAnalyzeCSV}
            loading={bulkLoading}
            disabled={csvEntries.filter((e) => e.company && e.role && e.jdText).length === 0}
            className="w-full"
            icon={<Sparkles className="h-4 w-4" />}
          >
            Analyze CSV ({csvEntries.filter((e) => e.company && e.role && e.jdText).length})
          </Button>
        </div>
      </div>
    )
  }

  function renderLeftPanel() {
    return (
      <div className="space-y-4">
        {/* segmented control */}
        <div className="flex p-0.5 bg-neutral-100 rounded-lg border border-neutral-200" role="tablist" aria-label="JD input mode">
          {(['single', 'multiple', 'csv'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={mode === t}
              onClick={() => {
                setMode(t)
                setBulkResults(null)
              }}
              className={`flex-1 py-1.5 text-center text-body-sm font-medium rounded-md transition-all duration-150 ${
                mode === t
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {mode === 'single' && (
          <div className="space-y-4">
            {targetApp && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                <div>
                  <p className="text-caption text-primary font-semibold">Active Context</p>
                  <p className="text-body-sm font-medium text-text-primary">
                    {targetApp.role} @ {targetApp.company}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/applications/${appId}`)}>
                  View App
                </Button>
              </div>
            )}
            <Section
              title="Paste Job Description"
              description="Paste the full job description to extract skills, keywords, and insights"
              action={{ label: 'Use Sample JD', onClick: handleSampleJD }}
              titleClassName="text-body font-semibold"
              descriptionClassName="text-caption"
            >
              <div className="relative">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full h-80 p-3 bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-md text-body-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-150 resize-none font-sans"
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
            </Section>

            <div className="flex gap-2">
              <Button onClick={handleAnalyze} loading={loading} className="w-full" size="lg" icon={<Sparkles className="h-4 w-4" />}>
                Analyze JD
              </Button>
            </div>

            {error && !loading && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-caption text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-red-600/90 mt-0.5">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="p-0.5 rounded hover:bg-red-100 transition-colors shrink-0" aria-label="Dismiss">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div>
              <p className="text-caption font-semibold text-text-secondary uppercase tracking-wider mb-2">Recent Analyses</p>
              <Input
                placeholder="Search recent analyses..."
                value={recentSearchValue}
                onChange={(e) => setRecentSearchValue(e.target.value)}
                className="mb-2"
              />
              <div className="border border-neutral-200 bg-white rounded-md overflow-hidden">
                {recentAnalyses.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <FileText className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
                    <p className="text-body-sm text-text-secondary">
                      {recentSearchValue.trim() ? 'No analyses match your search' : 'No recent analyses yet'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {recentAnalyses.map((item: any, idx: number) => (
                      <button
                        key={`${item._id ?? item.id ?? 'j'}-${idx}`}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-200 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-text-tertiary" />
                          <div className="min-w-0">
                            <p className="text-body-sm font-medium text-text-primary truncate">{item.role}</p>
                            <p className="text-caption text-text-secondary truncate">{item.company}</p>
                          </div>
                        </div>
                        <span className="text-caption text-text-tertiary shrink-0">{item.date ?? item.createdAt ?? ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'multiple' && renderMultipleTab()}
        {mode === 'csv' && renderCSVTab()}
      </div>
    )
  }

  function renderRightPanel() {
    if (bulkLoading) {
      return (
        <div className="space-y-4">
          <Skeleton variant="rectangular" width="100%" height={40} />
          <Skeleton variant="text" width="60%" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={80} height={28} />
            <Skeleton variant="rectangular" width={100} height={28} />
            <Skeleton variant="rectangular" width={60} height={28} />
          </div>
          <Skeleton variant="rectangular" width="100%" height={120} />
          <Skeleton variant="rectangular" width="100%" height={80} />
        </div>
      )
    }
    if (bulkResults && bulkResults.length > 0) {
      return (
        <div className="space-y-4">
          <div className="rounded-md border border-neutral-200 bg-white p-4">
            <p className="text-heading-3 text-text-primary font-semibold">Bulk Analysis Results</p>
            <p className="text-body-sm text-text-secondary mt-0.5">
              {`${bulkResults.filter((r) => r.kind === 'success').length} of ${bulkResults.length} succeeded`}
            </p>
          </div>
          <div className="space-y-2">
            {bulkResults.map((r, idx) => {
              if (r.kind === 'success') {
                return (
                  <button
                    key={`${r.applicationId}-${idx}`}
                    type="button"
                    onClick={() => navigate(`/applications/${r.applicationId}`)}
                    className="w-full flex items-center justify-between p-3 rounded-md bg-white border border-neutral-200 hover:border-primary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-semibold text-text-primary truncate">
                          {r.role}
                        </p>
                        <p className="text-caption text-text-secondary truncate">
                          {r.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-body-sm font-semibold text-primary">
                        {r.matchPercent}% match
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-caption bg-green-50 text-green-700 font-medium">
                        success
                      </span>
                    </div>
                  </button>
                )
              }
              return (
                <div
                  key={`err-${idx}-${r.company}`}
                  className="w-full flex items-center justify-between p-3 rounded-md bg-red-50/50 border border-red-200 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-text-primary truncate">
                        {r.role || '(no role)'} @ {r.company || '(no company)'}
                      </p>
                      <p className="text-caption text-red-600 truncate">{r.error}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-caption bg-red-50 text-red-700 font-medium shrink-0">
                    error
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    if (mode === 'single' && loading) {
      return (
        <div className="space-y-4">
          <Skeleton variant="rectangular" width="100%" height={40} />
          <Skeleton variant="text" width="60%" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={80} height={28} />
            <Skeleton variant="rectangular" width={100} height={28} />
            <Skeleton variant="rectangular" width={60} height={28} />
          </div>
          <Skeleton variant="rectangular" width="100%" height={120} />
          <Skeleton variant="rectangular" width="100%" height={80} />
        </div>
      )
    }
    if (mode === 'single' && analysis) {
      return (
        <div className="space-y-4">
          <JDSummary analysis={analysis} />
          <div className="flex justify-end">
            <Button
              onClick={() => navigate('/resume-strategy', { state: { analysis } })}
              icon={<Sparkles className="h-4 w-4" />}
            >
              Generate Resume Strategy
            </Button>
          </div>
        </div>
      )
    }
    if (mode === 'single') {
      return (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-text-tertiary" />}
          title="No Analysis Yet"
          description="Paste a job description on the left panel and click 'Analyze' to get started."
          action={{ label: 'Try Sample JD', onClick: handleSampleJD }}
        />
      )
    }
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12 text-text-tertiary" />}
        title={
          mode === 'multiple'
            ? 'No Bulk Analysis Yet'
            : 'No CSV Uploaded'
        }
        description={
          mode === 'multiple'
            ? 'Add JD entries on the left and click "Analyze all" to get started.'
            : 'Upload a CSV file on the left to preview and analyze in bulk.'
        }
      />
    )
  }

  return (
    <AppLayout>
      <SplitPanel
        leftWeight={1}
        rightWeight={2}
        left={renderLeftPanel()}
        right={renderRightPanel()}
      />
    </AppLayout>
  )
}

// Exported for unit testing
export { parseCSV, pickColumn }
