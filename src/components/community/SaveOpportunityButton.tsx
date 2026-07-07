import { useState, useRef, useEffect } from 'react'
import { BookmarkSimple, Bell, BellSlash } from '../../lib/icons'
import { useSavedOpportunities } from '../../hooks/useSavedOpportunities'
import { useToast } from '../layout/useToast'

interface SaveOpportunityButtonProps {
  opportunityId: string
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

export function SaveOpportunityButton({
  opportunityId,
  size = 'md',
  showLabel = false,
  className = '',
}: SaveOpportunityButtonProps) {
  const { showToast } = useToast()
  const { isSaved, toggle, setAlert, savedByOppId } = useSavedOpportunities()
  const entry = savedByOppId.get(opportunityId)
  const saved = isSaved(opportunityId)
  const alertEnabled = entry?.alertEnabled ?? true
  const [busy, setBusy] = useState(false)
  const [showAlertMenu, setShowAlertMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showAlertMenu) return
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAlertMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAlertMenu])

  const handleToggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      await toggle(opportunityId, true)
    } catch {
      // Toast already shown by hook.
    } finally {
      setBusy(false)
    }
  }

  const handleAlertToggle = async (next: boolean) => {
    setShowAlertMenu(false)
    try {
      await setAlert(opportunityId, next)
      showToast(
        next ? 'Deadline alerts enabled' : 'Deadline alerts disabled',
        'success',
      )
    } catch {
      // Toast already shown by hook.
    }
  }

  const dimension = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={busy}
        aria-pressed={saved}
        aria-label={saved ? 'Unsave opportunity' : 'Save opportunity'}
        title={saved ? 'Saved' : 'Save this opportunity'}
        className={[
          'inline-flex items-center justify-center gap-1.5 rounded-full border transition-colors disabled:opacity-50',
          dimension,
          showLabel ? 'px-3 w-auto' : '',
          saved
            ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/15'
            : 'bg-surface border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/40',
        ].join(' ')}
      >
        <BookmarkSimple
          weight={saved ? 'fill' : 'regular'}
          size={iconSize}
          aria-hidden="true"
        />
        {showLabel && (
          <span className="text-label-sm font-medium">
            {saved ? 'Saved' : 'Save'}
          </span>
        )}
      </button>

      {saved && (
        <button
          type="button"
          onClick={() => setShowAlertMenu(open => !open)}
          aria-label={alertEnabled ? 'Disable deadline alerts' : 'Enable deadline alerts'}
          title={alertEnabled ? 'Alerts on' : 'Alerts off'}
          className={[
            'inline-flex items-center justify-center rounded-full border transition-colors',
            dimension,
            alertEnabled
              ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/15'
              : 'bg-surface border-outline-variant text-on-surface-variant hover:text-on-surface',
          ].join(' ')}
        >
          {alertEnabled ? (
            <Bell size={iconSize} weight="fill" aria-hidden="true" />
          ) : (
            <BellSlash size={iconSize} aria-hidden="true" />
          )}
        </button>
      )}

      {showAlertMenu && saved && (
        <div
          role="menu"
          aria-label="Alert preferences"
          className="absolute right-0 top-full mt-1 z-20 w-56 bg-surface border border-outline-variant rounded-lg shadow-lg p-2"
        >
          <p className="text-label-xs text-on-surface-variant px-2 py-1">
            Deadline alerts
          </p>
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={alertEnabled}
            onClick={() => handleAlertToggle(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-label-sm text-on-surface hover:bg-surface-container-low text-left"
          >
            <Bell size={14} weight={alertEnabled ? 'fill' : 'regular'} />
            <span className="flex-1">On</span>
            {alertEnabled && (
              <span className="text-primary text-label-xs">Active</span>
            )}
          </button>
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={!alertEnabled}
            onClick={() => handleAlertToggle(false)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-label-sm text-on-surface hover:bg-surface-container-low text-left"
          >
            <BellSlash size={14} />
            <span className="flex-1">Off</span>
            {!alertEnabled && (
              <span className="text-primary text-label-xs">Active</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
