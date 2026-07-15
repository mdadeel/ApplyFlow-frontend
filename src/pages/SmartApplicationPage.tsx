import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '../components/layout/AppLayout'
import {
  smartApplicationService,
  type SmartApplicationResult,
} from '../services/smartApplication'
import { resumeLibraryService } from '../services/resumeLibrary'
import { get } from '../services/api'
import { Briefcase } from '../lib/icons'
import { useToast } from '../components/layout/useToast'
import {
  SmartApplicationInputPanel,
  type InputMode,
} from '../components/features/SmartApplicationInputPanel'
import {
  SmartApplicationResultPanel,
  type ResultTab,
  type BulkResultItem,
} from '../components/features/SmartApplicationResultPanel'

export { type InputMode, type ResultTab }

export function SmartApplicationPage() {
  const { showToast } = useToast()

  // ── Input state ──────────────────────────────────────────
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [jdText, setJdText] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [masterCVFile, setMasterCVFile] = useState<File | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')

  // ── Result state ─────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<SmartApplicationResult | null>(null)
  const [resultTab, setResultTab] = useState<ResultTab>('resume')
  const [editedResume, setEditedResume] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [bulkResults, setBulkResults] = useState<BulkResultItem[] | null>(null)

  // ── Timer & retry state ──────────────────────────────────
  const [elapsedMs, setElapsedMs] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const generationStartRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    if (isGenerating) {
      generationStartRef.current = Date.now()
      setElapsedMs(0)
      const id = setInterval(() => {
        setElapsedMs(Date.now() - generationStartRef.current)
      }, 1000)
      timerRef.current = id
      return () => clearInterval(id)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isGenerating])

  // ── Data fetching (React Query) ───────────────────────────
  const resumesQuery = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { resumes } = await resumeLibraryService.getResumes()
      return resumes
    },
    staleTime: 60 * 1000,
  })
  const uploadedResumes = resumesQuery.data ?? []
  const resumesLoading = resumesQuery.isLoading

  // ── Recent JD analyses (for "Use existing job description") ──
  interface RecentJD {
    _id: string
    company: string
    role: string
    jdText?: string
    createdAt?: string
  }
  const recentJDQuery = useQuery({
    queryKey: ['jd-analyses', 'recent'],
    queryFn: async () => {
      const raw = await get<RecentJD[] | { data: RecentJD[] } | { items: RecentJD[] }>(
        '/jd',
        { limit: 20 },
      )
      if (Array.isArray(raw)) return raw
      const obj = raw as { data?: RecentJD[]; items?: RecentJD[] }
      return obj.data ?? obj.items ?? []
    },
    staleTime: 30_000,
  })
  const recentJDs: RecentJD[] = recentJDQuery.data ?? []

  const handleSelectRecentJD = useCallback(
    (id: string) => {
      const picked = recentJDs.find((j) => j._id === id)
      if (!picked) return
      if (picked.jdText) setJdText(picked.jdText)
      if (picked.company) setCompany(picked.company)
      if (picked.role) setRole(picked.role)
      showToast(`Loaded JD: ${picked.role} @ ${picked.company}`, 'success')
    },
    [recentJDs, showToast],
  )

  // Bulk item type for AI-split results
  type BulkItem = SmartApplicationResult | { error: string; company: string; role: string }

  // ── Handlers ──────────────────────────────────────────────
  const validateTextInput = (): boolean => {
    if (!jdText.trim() || jdText.trim().length < 50) {
      showToast('Please paste at least 50 characters of a job description', 'error')
      return false
    }
    return true
  }

  const validateCsvInput = (): boolean => {
    if (!masterCVFile || masterCVFile.type !== 'text/csv') {
      showToast('Please upload a CSV file', 'error')
      return false
    }
    return true
  }

  const handleGenerate = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setFailedAttempts(0)
      setErrorMessage(null)
    }
    setIsGenerating(true)
    setResult(null)
    setBulkResults(null)
    setErrorMessage(null)

    try {
      if (inputMode === 'text') {
        if (!validateTextInput()) { setIsGenerating(false); return }

        // Send raw text to AI — it auto-detects 1 or multiple JDs
        const data = await smartApplicationService.aiCreate({
          jdText,
          company: company || undefined,
          role: role || undefined,
          masterCVFile: masterCVFile || undefined,
          resumeId: selectedResumeId || undefined,
        })

        if ('results' in data && Array.isArray(data.results)) {
          setBulkResults(data.results as BulkItem[])
          const firstSuccess = (data.results as BulkItem[]).find((r): r is SmartApplicationResult => 'output' in r)
          if (firstSuccess) {
            setResult(firstSuccess)
            setEditedResume(firstSuccess.output.resume.markdown)
            setResultTab('resume')
          }
          showToast(`Generated ${data.results.length} application(s)`, 'success')
        } else {
          // Single result (not wrapped in bulk)
          const singleResult = data as SmartApplicationResult
          setResult(singleResult)
          setEditedResume(singleResult.output.resume.markdown)
          setResultTab('resume')
          showToast('Application package generated!', 'success')
        }
      } else {
        if (!validateCsvInput()) { setIsGenerating(false); return }
        const csvData = await smartApplicationService.bulkCreate({
          jds: [],
          masterCVFile: masterCVFile!,
          resumeId: selectedResumeId || undefined,
        })
        setBulkResults(csvData.results as BulkItem[])
        const firstSuccess = csvData.results.find((r): r is SmartApplicationResult => 'output' in r)
        if (firstSuccess) {
          setResult(firstSuccess)
          setEditedResume(firstSuccess.output.resume.markdown)
          setResultTab('resume')
        }
        showToast(`Generated ${csvData.results.length} application(s)`, 'success')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate application'
      setFailedAttempts((prev) => prev + 1)
      setErrorMessage(message)
      showToast(message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }, [inputMode, jdText, company, role, masterCVFile, selectedResumeId, showToast])

  const handleExportAll = useCallback(async () => {
    if (!result) return
    try {
      await smartApplicationService.exportAllFormats(result.applicationId)
      showToast('Export started. Files saved to applications folder.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      showToast(message, 'error')
    }
  }, [result, showToast])

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      showToast('Copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy', 'error')
    }
  }, [showToast])

  const handleRetry = useCallback(() => handleGenerate(true), [handleGenerate])
  const handleStartOver = useCallback(() => {
    setFailedAttempts(0)
    setErrorMessage(null)
  }, [])
  const handleResultSelect = useCallback((item: SmartApplicationResult) => {
    setResult(item)
    setEditedResume(item.output.resume.markdown)
    setResultTab('resume')
  }, [])

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-3">
        {recentJDs.length > 0 && (
          <div className="rounded-lg border border-border bg-surface shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="text-body-sm font-semibold text-text-primary">
                {'Use existing job description'}
              </h3>
              {recentJDQuery.isFetching && (
                <span className="text-caption text-text-tertiary">{'refreshing…'}</span>
              )}
            </div>
            <p className="text-caption text-text-secondary mb-2">
              {'Pick a previously analyzed JD to auto-fill the description, company, and role below.'}
            </p>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectRecentJD(e.target.value)
                  e.target.value = ''
                }
              }}
              className="w-full p-2 rounded-md border border-neutral-300 bg-neutral-50 hover:border-neutral-400 text-body-sm text-text-primary outline-none focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              aria-label="Select a recent job description"
            >
              <option value="" disabled>
                {'Choose a recent JD…'}
              </option>
              {recentJDs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.role} @ {j.company}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          <SmartApplicationInputPanel
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            jdText={jdText}
            onJdTextChange={setJdText}
            company={company}
            onCompanyChange={setCompany}
            role={role}
            onRoleChange={setRole}
            masterCVFile={masterCVFile}
            onMasterCVFileChange={setMasterCVFile}
            uploadedResumes={uploadedResumes}
            resumesLoading={resumesLoading}
            selectedResumeId={selectedResumeId}
            onSelectedResumeIdChange={setSelectedResumeId}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerate()}
          />
          <SmartApplicationResultPanel
            errorMessage={errorMessage}
            isGenerating={isGenerating}
            result={result}
            resultTab={resultTab}
            onResultTabChange={setResultTab}
            editedResume={editedResume}
            onEditedResumeChange={setEditedResume}
            bulkResults={bulkResults}
            elapsedMs={elapsedMs}
            failedAttempts={failedAttempts}
            onRetry={handleRetry}
            onStartOver={handleStartOver}
            onExportAll={handleExportAll}
            copiedField={copiedField}
            onCopy={copyToClipboard}
            onResultSelect={handleResultSelect}
          />
        </div>
      </div>
    </AppLayout>
  )
}
