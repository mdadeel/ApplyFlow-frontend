import { useCallback, useRef } from 'react'
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  X,
  FileSpreadsheet,
} from '../../lib/icons'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Tabs } from '../ui/Tabs'
import { Skeleton } from '../ui/Skeleton'
import { useToast } from '../layout/useToast'
import type { UploadedResume } from '../../types'

export type InputMode = 'text' | 'csv'

export interface SmartApplicationInputPanelProps {
  inputMode: InputMode
  onInputModeChange: (mode: InputMode) => void
  jdText: string
  onJdTextChange: (text: string) => void
  company: string
  onCompanyChange: (company: string) => void
  role: string
  onRoleChange: (role: string) => void
  masterCVFile: File | null
  onMasterCVFileChange: (file: File | null) => void
  uploadedResumes: UploadedResume[]
  resumesLoading: boolean
  selectedResumeId: string
  onSelectedResumeIdChange: (id: string) => void
  isGenerating: boolean
  onGenerate: () => void
}

export function SmartApplicationInputPanel({
  inputMode,
  onInputModeChange,
  jdText,
  onJdTextChange,
  company,
  onCompanyChange,
  role,
  onRoleChange,
  masterCVFile,
  onMasterCVFileChange,
  uploadedResumes,
  resumesLoading,
  selectedResumeId,
  onSelectedResumeIdChange,
  isGenerating,
  onGenerate,
}: SmartApplicationInputPanelProps) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        file.type !== 'application/msword' &&
        file.type !== 'text/csv'
      ) {
        showToast('Only DOCX, DOC, and CSV files are supported', 'error')
        return
      }
      if (inputMode === 'csv' && file.type !== 'text/csv') {
        showToast('Please upload a CSV file for bulk CSV mode', 'error')
        return
      }
      if (inputMode !== 'csv' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && file.type !== 'application/msword') {
        showToast('Please upload a .docx or .doc file', 'error')
        return
      }
      onMasterCVFileChange(file)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) {
        if (inputMode === 'csv') {
          if (file.type !== 'text/csv') {
            showToast('Please upload a CSV file for bulk CSV mode', 'error')
            return
          }
        } else {
          if (
            file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
            file.type !== 'application/msword'
          ) {
            showToast('Please upload a .docx or .doc file', 'error')
            return
          }
        }
        onMasterCVFileChange(file)
      }
    },
    [showToast, inputMode, onMasterCVFileChange],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-heading-3 text-text-primary flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Job Description
        </h2>
        <p className="text-body-sm text-text-secondary mt-1">
          Paste one or more job descriptions and generate a tailored package for each.
        </p>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <Tabs
          tabs={[
            { id: 'text', label: 'Paste JD(s)' },
            { id: 'csv', label: 'Upload CSV' },
          ]}
          activeTab={inputMode}
          onChange={(id) => onInputModeChange(id as InputMode)}
        />

        {inputMode === 'text' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Company (optional)"
                placeholder="e.g. Google"
                value={company}
                onChange={(e) => onCompanyChange(e.target.value)}
              />
              <Input
                label="Role (optional)"
                placeholder="e.g. Frontend Engineer"
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-text-primary">Job Description</label>
              <textarea
                value={jdText}
                onChange={(e) => onJdTextChange(e.target.value)}
                placeholder="Paste one or more job descriptions here..."
                className="w-full h-44 p-3 bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-md text-body text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              />
              <p className="text-caption text-text-secondary">
                Paste one or more job descriptions. The AI will automatically detect and process them.
              </p>
            </div>
          </div>
        )}

        {inputMode === 'csv' && (
          <div className="space-y-3">
            <div className="p-3 bg-surface-secondary rounded-lg">
              <p className="text-body-sm text-text-secondary">
                Upload a CSV with columns: <code>company</code>, <code>role</code>,{' '}
                <code>jd_text</code> (or <code>job_description</code>).
              </p>
            </div>
            {!masterCVFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-neutral-300 rounded-md p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-150"
              >
                <FileSpreadsheet className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
                <p className="text-body-sm font-medium text-text-primary">Upload CSV of JDs</p>
                <p className="text-caption text-text-secondary mt-1">Drag & drop or click to browse</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-body-sm text-text-primary truncate">{masterCVFile.name}</span>
                </div>
                <button
                  onClick={() => onMasterCVFileChange(null)}
                  className="p-1 rounded hover:bg-surface-tertiary text-text-tertiary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resume selector */}
        <div className="space-y-2">
          <label className="text-body-sm font-medium text-text-primary">Select Resume (optional)</label>
          {resumesLoading ? (
            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
              <Skeleton className="h-5 w-full" />
            </div>
          ) : uploadedResumes.length > 0 ? (
            <div className="space-y-1.5">
              <select
                value={selectedResumeId}
                onChange={(e) => onSelectedResumeIdChange(e.target.value)}
                className="w-full p-2 rounded-md border border-neutral-300 bg-neutral-50 hover:border-neutral-400 text-body-sm text-text-primary outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              >
                <option value="">No resume (generate fresh)</option>
                {uploadedResumes.map((r) => (
                  <option key={r._id} value={r._id}>{r.fileName}</option>
                ))}
              </select>
              <p className="text-caption text-text-secondary">
                Select an uploaded resume to use as your master CV.
                <a href="/profile" className="text-primary hover:underline ml-1">Manage resumes</a>
              </p>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-neutral-300 rounded-md p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-150"
            >
              <Upload className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
              <p className="text-body-sm font-medium text-text-primary">Upload DOCX CV</p>
              <p className="text-caption text-text-secondary mt-1">Drag & drop or click to browse</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Sticky footer with Generate button */}
      <div className="border-t border-border p-4 bg-white shrink-0">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full gap-2"
          size="lg"
        >
          {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {isGenerating ? 'Generating...' : 'Generate Application Package'}
        </Button>
      </div>
    </Card>
  )
}
