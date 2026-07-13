import { useState, useRef } from 'react'
import { Upload, X, FileText, AlertCircle } from '../../lib/icons'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in bytes
  onChange: (file: File | null) => void
  value?: File | null
  label?: string
  hint?: string
}

export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onChange,
  value,
  label = 'Upload File',
  hint,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptTypes = accept
    ? accept.split(',').map(t => t.trim())
    : ['.pdf', '.docx', '.doc', '.txt', '.md']

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  function validate(file: File): boolean {
    if (maxSize && file.size > maxSize) {
      setError(`File size must be less than ${formatSize(maxSize)}`)
      return false
    }
    if (accept) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      const mimeOk = acceptTypes.some(t => {
        if (t.startsWith('.')) return ext === t.toLowerCase()
        return file.type.match(t.replace('*', '.*'))
      })
      if (!mimeOk) {
        setError(`File type not supported. Accepted: ${accept}`)
        return false
      }
    }
    setError(null)
    return true
  }

  function handleFile(file: File | null) {
    if (!file) {
      onChange(null)
      setError(null)
      return
    }
    if (validate(file)) {
      onChange(file)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file || null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    handleFile(file || null)
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemove() {
    onChange(null)
    setError(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-label-sm font-medium text-on-surface">
        {label}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragOver
            ? 'border-primary bg-primary/5'
            : value
              ? 'border-success bg-success/5'
              : 'border-outline-variant hover:border-primary/50 hover:bg-surface-secondary'
          }
        `}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || acceptTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />

        {value ? (
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 text-success">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-body-sm font-medium text-on-surface">{value.name}</p>
            <p className="text-label-sm text-on-surface-variant">{formatSize(value.size)}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              className="inline-flex items-center gap-1 text-label-sm text-error hover:text-error/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-body-sm text-on-surface">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-label-sm text-on-surface-variant mt-1">
                {accept ? accept.split(',').join(', ') : 'PDF, DOCX, DOC, TXT, MD'}
                {' — '}Max {formatSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>

      {hint && !error && !value && (
        <p className="text-label-sm text-on-surface-variant">{hint}</p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-label-sm text-error">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
