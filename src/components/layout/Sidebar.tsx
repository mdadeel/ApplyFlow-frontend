import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  Briefcase,
  User,
  BarChart3,
  Lightbulb,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
} from '../../lib/icons'
import { useLayout } from './useLayout'
import { Button } from '../ui/Button'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Applications', icon: Briefcase, href: '/applications' },
  { label: 'Career Profile', icon: User, href: '/profile' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

const bottomItems: NavItem[] = [
  { label: 'AI Insights', icon: Lightbulb, href: '/insights' },
]

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useLayout()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname, setMobileSidebarOpen])

  function isActive(href: string) {
    if (href === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(href)
  }

  function handleNav(href: string) {
    navigate(href)
  }

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          bg-surface border-r border-outline-variant
          sidebar-transition
          ${sidebarCollapsed ? 'w-[72px]' : 'w-60'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 h-16 px-4 border-b border-outline-variant shrink-0">
          <div
            className="w-8 h-8 bg-primary-container text-white rounded-full flex items-center justify-center text-label-md font-bold shrink-0"
            aria-hidden="true"
          >
            A
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-headline-md text-on-surface truncate">
                ApplyFlow AI
              </span>
              <span className="text-label-sm text-on-surface-variant truncate">
                Career Workspace
              </span>
            </div>
          )}
        </div>

        <div className="px-3 pt-4 pb-2 shrink-0">
          {sidebarCollapsed ? (
            <button
              onClick={() => handleNav('/applications?new=true')}
              className="w-10 h-10 bg-primary-container text-white rounded-xl flex items-center justify-center mx-auto hover:opacity-90 transition-opacity"
              aria-label="New Application"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <Button
              variant="secondary"
              className="w-full gap-2 rounded-lg"
              onClick={() => handleNav('/applications?new=true')}
            >
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          )}
        </div>

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={e => {
                  e.preventDefault()
                  handleNav(item.href)
                }}                  className={`group
                  flex items-center gap-3 px-3 py-2 rounded cursor-pointer
                  transition-colors
                  ${sidebarCollapsed ? 'justify-center px-0' : ''}
                  ${active
                    ? 'bg-surface-container-low text-primary font-semibold border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent'
                  }
                `}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-150" aria-hidden="true" />
                {!sidebarCollapsed && (
                  <span className="text-body-md truncate">{item.label}</span>
                )}
              </a>
            )
          })}
        </nav>

        <div className="border-t border-outline-variant px-2 py-2 space-y-1 shrink-0">
          {bottomItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={e => {
                  e.preventDefault()
                  handleNav(item.href)
                }}
                className={`group
                  flex items-center gap-3 px-3 py-2 rounded cursor-pointer
                  transition-colors
                  ${sidebarCollapsed ? 'justify-center px-0' : ''}
                  ${active
                    ? 'bg-surface-container-low text-primary font-semibold border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent'
                  }
                `}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-150" aria-hidden="true" />
                {!sidebarCollapsed && (
                  <span className="text-body-md truncate">{item.label}</span>
                )}
              </a>
            )
          })}

          <button
            onClick={toggleSidebar}
            className={`
              flex items-center gap-3 px-3 py-2 rounded w-full cursor-pointer
              transition-colors text-on-surface-variant hover:bg-surface-container hover:text-on-surface
              ${sidebarCollapsed ? 'justify-center px-0' : ''}
            `}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="text-body-md">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
