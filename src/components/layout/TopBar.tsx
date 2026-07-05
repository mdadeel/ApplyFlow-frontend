import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Search, Menu, Bell, CircleHelp } from '../../lib/icons'
import { useLayout } from './useLayout'
import { Breadcrumb } from './Breadcrumb'
import { NotificationPanel } from './NotificationPanel'
import { HelpPanel } from './HelpPanel'
import { ShortcutsModal } from './ShortcutsModal'
import { WhatsNewModal } from './WhatsNewModal'
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)
  const [whatsNewModalOpen, setWhatsNewModalOpen] = useState(false)
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
      if (!cancelled) fetchUnreadCount()
    }, NOTIFICATION_POLL_INTERVAL_MS)

    const handleAuthExpired = (): void => {
      window.clearInterval(intervalId)
      setUnreadCount(0)
    }
    window.addEventListener('auth:expired', handleAuthExpired)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
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
        setShortcutsModalOpen((prev) => !prev)
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
    setHelpOpen(false)
    switch (id) {
      case 'docs':
        window.open('https://applyflow.ai/docs', '_blank', 'noopener,noreferrer')
        break
      case 'shortcuts':
        setShortcutsModalOpen(true)
        break
      case 'feedback':
        window.open('mailto:feedback@applyflow.ai', '_blank')
        break
      case 'whats-new':
        setWhatsNewModalOpen(true)
        break
    }
  }

  const handleNotificationsToggle = () => {
    setNotificationsOpen((prev) => !prev)
  }

  const handleNotificationsClose = () => {
    setNotificationsOpen(false)
  }

  return (
    <header className="h-14 border-b border-outline-variant bg-surface flex items-center justify-between px-lg shrink-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface-variant focus-within:border-primary focus-within:text-on-surface transition-colors">
          <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search..."
            value={localSearch}
            onChange={handleSearchChange}
            className="bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-on-surface-variant w-48"
            aria-label="Search"
          />
        </div>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationsToggle}
            className="relative p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center pointer-events-none"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <NotificationPanel
              onClose={handleNotificationsClose}
              onUnreadCountChange={setUnreadCount}
            />
          )}
        </div>

        <div className="relative" ref={helpRef}>
          <button
            onClick={() => setHelpOpen((prev) => !prev)}
            className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Help"
            aria-expanded={helpOpen}
            aria-haspopup="menu"
          >
            <CircleHelp className="w-5 h-5" />
          </button>
          {helpOpen && (
            <HelpPanel
              onClose={() => setHelpOpen(false)}
              onSelect={handleHelpSelect}
            />
          )}
        </div>

        <div
          className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-label-md font-semibold shrink-0 cursor-default"
          aria-label="User avatar"
        >
          SA
        </div>
      </div>

      <ShortcutsModal
        open={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
      <WhatsNewModal
        open={whatsNewModalOpen}
        onClose={() => setWhatsNewModalOpen(false)}
      />
    </header>
  )
}
