import { useState, useRef, useEffect, useCallback } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import {
  smartApplicationService,
  type SmartApplicationResult,
} from '../services/smartApplication'
import { resumeLibraryService } from '../services/resumeLibrary'
import type { UploadedResume } from '../types'
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
  const [uploadedResumes, setUploadedResumes] = useState<UploadedResume[]>([])
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
  const [resumesLoading, setResumesLoading] = useState(false)

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

  useEffect(() => {
    let cancelled = false
    async function load() {
      setResumesLoading(true)
      try {
        const { resumes } = await resumeLibraryService.getResumes()
        if (!cancelled) setUploadedResumes(resumes)
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setResumesLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-heading-1 text-text-primary">Smart Application</h1>
          <p className="text-body text-text-secondary mt-1">
            Generate a complete job application package in one step.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
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
