import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Search, Menu, Bell, CircleHelp } from '../../lib/icons'
import { useLayout } from './useLayout'
import { Breadcrumb } from './Breadcrumb'
import { NotificationPanel } from './NotificationPanel'
import { HelpPanel } from './HelpPanel'
import { ShortcutsModal } from './ShortcutsModal'
import { WhatsNewModal } from './WhatsNewModal'
import { CommandPalette } from '../ui/CommandPalette'
import { getNotifications } from '../../services/notifications'

interface TopBarProps {
  onSearch?: (value: string) => void
  searchValue?: string
}

const SEARCH_DEBOUNCE_MS = 300
const NOTIFICATION_POLL_INTERVAL_MS = 60_000

export function TopBar({ onSearch, searchValue = '' }: TopBarProps) {
  const { setMobileSidebarOpen } = useLayout()
  const [localSearch, setLocalSearch] = useState(searchValue)
  const [activePanel, setActivePanel] = useState<'notifications' | 'help' | null>(null)
  const [activeModal, setActiveModal] = useState<'shortcuts' | 'whats-new' | 'command-palette' | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = async (): Promise<void> => {
    try {
      const response = await getNotifications()
      setUnreadCount(response.unreadCount)
    } catch {
      // Silent failure for the background poll — the panel surfaces its own errors.
    }
  }

  useEffect(() => {
    let cancelled = false

    fetchUnreadCount()
    const intervalId = window.setInterval(() => {
      if (!cancelled && !document.hidden) fetchUnreadCount()
    }, NOTIFICATION_POLL_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (!document.hidden && !cancelled) fetchUnreadCount()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleAuthExpired = (): void => {
      window.clearInterval(intervalId)
      setUnreadCount(0)
    }
    window.addEventListener('auth:expired', handleAuthExpired)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('auth:expired', handleAuthExpired)
    }
  }, [])

  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setActiveModal(prev => prev === 'shortcuts' ? null : 'shortcuts')
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveModal('command-palette')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch?.(value)
    }, SEARCH_DEBOUNCE_MS)
  }

  const handleHelpSelect = (id: string) => {
    setActivePanel(null)
    switch (id) {
      case 'docs':
        window.open('https://applyflow.ai/docs', '_blank', 'noopener,noreferrer')
        break
      case 'shortcuts':
        setActiveModal('shortcuts')
        break
      case 'feedback':
        window.open('mailto:feedback@applyflow.ai', '_blank')
        break
      case 'whats-new':
        setActiveModal('whats-new')
        break
    }
  }

  const handleNotificationsToggle = () => {
    setActivePanel(prev => prev === 'notifications' ? null : 'notifications')
  }

  const handleNotificationsClose = () => {
    setActivePanel(null)
  }

  return (
    <header className="h-14 border-b border-border bg-surface/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 shrink-0 transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-1 rounded hover:bg-surface-secondary text-text-secondary transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onSearch && (
          <button
            onClick={() => setActiveModal('command-palette')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 w-64 rounded-lg bg-surface-secondary border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors text-left"
            aria-label="Search or jump to..."
          >
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-body-sm text-text-tertiary flex-1">Search or jump to...</span>
            <span className="flex items-center justify-center h-5 px-1.5 rounded bg-surface-tertiary text-[10px] font-medium text-text-secondary border border-border">
              ⌘K
            </span>
          </button>
        )}
        {!onSearch && (
          <button
            onClick={() => setActiveModal('command-palette')}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg bg-surface-secondary border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
            aria-label="Open command palette"
            title="Open command palette (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationsToggle}
            className="relative p-1.5 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Notifications"
            aria-expanded={activePanel === 'notifications'}
            aria-haspopup="dialog"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center pointer-events-none"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {activePanel === 'notifications' && (
            <NotificationPanel
              onClose={handleNotificationsClose}
              onUnreadCountChange={setUnreadCount}
            />
          )}
        </div>

        <div className="relative" ref={helpRef}>
          <button
            onClick={() => setActivePanel(prev => prev === 'help' ? null : 'help')}
            className="p-1.5 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Help"
            aria-expanded={activePanel === 'help'}
            aria-haspopup="menu"
          >
            <CircleHelp className="w-5 h-5" />
          </button>
          {activePanel === 'help' && (
            <HelpPanel
              onClose={() => setActivePanel(null)}
              onSelect={handleHelpSelect}
            />
          )}
        </div>

      </div>

      <ShortcutsModal
        open={activeModal === 'shortcuts'}
        onClose={() => setActiveModal(null)}
      />
      <WhatsNewModal
        open={activeModal === 'whats-new'}
        onClose={() => setActiveModal(null)}
      />
      <CommandPalette
        open={activeModal === 'command-palette'}
        onClose={() => setActiveModal(null)}
      />
    </header>
  )
}
