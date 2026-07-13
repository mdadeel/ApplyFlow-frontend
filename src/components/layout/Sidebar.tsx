import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  Briefcase,
  User,
  BarChart3,
  BrainCircuit,
  Plus,
  ChevronRight,
  Users,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
  FileSearch,
  FileText,
  MessageCircle,
  Settings,
  FileCheck,
} from '../../lib/icons'
import type { LucideIcon } from '../../lib/icons'
import { useLayout } from './useLayout'
import { Button } from '../ui/Button'
import { Tooltip } from '../ui/Tooltip'
import { Avatar } from './Avatar'
import { getSuggestions } from '../../services/learning'
import { getPersonal } from '../../services/profile'
import { useAuthStore } from '../../stores/authStore'

export interface SubNavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: 'unread' | 'count'
  badgeCount?: number
  visibleWhenCollapsed: boolean
  children?: SubNavItem[]
}

interface Section {
  id: string
  label: string
  items: NavItem[]
}

const sections: Section[] = [
  {
    id: 'overview',
    label: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', visibleWhenCollapsed: true },
    ],
  },
  {
    id: 'ai-copilot',
    label: 'AI Co-pilot',
    items: [
      { id: 'smart-application', label: 'Smart Application', icon: Zap, href: '/smart-application', visibleWhenCollapsed: true },
      { id: 'jd-analysis', label: 'JD Analysis', icon: FileSearch, href: '/jd-analysis', visibleWhenCollapsed: true },
      {
        id: 'resumes',
        label: 'Resumes',
        icon: FileText,
        href: '/resume-library',
        visibleWhenCollapsed: true,
        children: [
          { id: 'resume-editor', label: 'Resume Editor', icon: FileText, href: '/resume-editor' },
          { id: 'resume-library', label: 'Resume Library', icon: FileCheck, href: '/resume-library' },
        ],
      },
      { id: 'interview-prep', label: 'Interview Prep', icon: MessageCircle, href: '/interview', visibleWhenCollapsed: true },
    ],
  },
  {
    id: 'tracker',
    label: 'Tracker',
    items: [
      { id: 'applications', label: 'Applications', icon: Briefcase, href: '/applications', visibleWhenCollapsed: true },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', visibleWhenCollapsed: true },
    ],
  },
  {
    id: 'network',
    label: 'Network',
    items: [
      { id: 'feed', label: 'Feed', icon: Sparkles, href: '/community/feed', badge: 'count', badgeCount: 0, visibleWhenCollapsed: true },
      { id: 'opportunities', label: 'Job Board', icon: Target, href: '/community/opportunities', visibleWhenCollapsed: true },
      { id: 'discussions', label: 'Discussions', icon: MessageSquare, href: '/community/discussions', visibleWhenCollapsed: false },
      { id: 'referrals', label: 'Referrals', icon: Users, href: '/community/referrals', visibleWhenCollapsed: false },
      { id: 'templates', label: 'Templates', icon: FileText, href: '/community/templates', visibleWhenCollapsed: false },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { id: 'profile', label: 'Career Profile', icon: User, href: '/profile', visibleWhenCollapsed: true },
      { id: 'learning', label: 'Learning Center', icon: BrainCircuit, href: '/admin/learning', badge: 'count', badgeCount: 0, visibleWhenCollapsed: true },
    ],
  },
]

export function Sidebar(): JSX.Element {
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useLayout()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userNameQuery = useQuery({
    queryKey: ['sidebar', 'userName'],
    queryFn: () => getPersonal(),
    staleTime: 5 * 60 * 1000,
  })
  const userName = userNameQuery.data?.name ?? null

  const suggestionsQuery = useQuery({
    queryKey: ['sidebar', 'suggestions'],
    queryFn: () => getSuggestions(),
    refetchInterval: 30_000,
    staleTime: 30_000,
  })
  const learningBadgeCount = suggestionsQuery.data?.count ?? 0

  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(() => ({
    resumes: true,
  }))

  const userAvatarUrl = user?.avatarUrl ?? null

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname, setMobileSidebarOpen])

  function isActive(item: NavItem): boolean {
    if (item.href === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    if (item.children) {
      return item.children.some((child) => location.pathname === child.href || location.pathname.startsWith(`${child.href}/`))
    }
    return location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
  }

  function isChildActive(child: SubNavItem): boolean {
    return location.pathname === child.href || location.pathname.startsWith(`${child.href}/`)
  }

  function handleNav(href: string) {
    navigate(href)
  }

  function toggleParent(id: string) {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function renderNavItem(item: NavItem) {
    const Icon = item.icon
    const active = isActive(item)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedParents[item.id] ?? false

    const shouldAutoExpand = hasChildren && item.children!.some((child) => isChildActive(child))
    const effectiveExpanded = shouldAutoExpand || isExpanded

    const effectiveBadgeCount = item.id === 'learning' ? learningBadgeCount : (item.badgeCount ?? 0)
    const showBadge = item.badge === 'unread' || (item.badge === 'count' && effectiveBadgeCount > 0)
    const showCountBadge = item.badge === 'count' && effectiveBadgeCount > 0

    if (sidebarCollapsed) {
      return (
        <a
          key={item.id}
          href={item.href}
          onClick={e => {
            e.preventDefault()
            handleNav(item.href)}
          }
          className={`group flex items-center justify-center w-10 h-10 mx-auto rounded-lg cursor-pointer transition-colors ${active ? 'bg-surface-secondary text-primary' : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'}`}
          aria-current={active ? 'page' : undefined}
          aria-label={item.label}
          title={item.label}
        >
          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
        </a>
      )
    }

    if (!hasChildren) {
      return (
        <a
          key={item.id}
          href={item.href}
          onClick={e => {
            e.preventDefault()
            handleNav(item.href)
          }}
          className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-surface-secondary text-primary font-semibold' : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'}`}
          aria-current={active ? 'page' : undefined}
        >
          <div className={`w-0.5 h-5 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-transparent'}`} />
          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-body-sm truncate flex-1">{item.label}</span>
          {showBadge && (showCountBadge ? (
            <Tooltip content={`${effectiveBadgeCount} ${item.id === 'learning' ? 'active suggestion' : 'active'}${effectiveBadgeCount !== 1 ? 's' : ''}`} position="top">
              <span
                aria-label={`${effectiveBadgeCount} active`}
                className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[11px] font-bold shrink-0"
              >
                {effectiveBadgeCount > 9 ? '9+' : effectiveBadgeCount}
              </span>
            </Tooltip>
          ) : (
            <span
              aria-label="unread"
              className="ml-auto inline-block w-2 h-2 rounded-full bg-primary shrink-0"
            />
          ))}
        </a>
      )
    }

    return (
      <div key={item.id}>
        <div
          className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-surface-secondary text-primary font-semibold' : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'}`}
        >
          <div className={`w-0.5 h-5 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-transparent'}`} />
          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          <button
            onClick={() => handleNav(item.href)}
            className="flex-1 text-left text-body-sm truncate cursor-pointer"
          >
            {item.label}
          </button>

          {showBadge && (showCountBadge ? (
            <Tooltip content={`${effectiveBadgeCount} ${item.id === 'learning' ? 'active suggestion' : 'active'}${effectiveBadgeCount !== 1 ? 's' : ''}`} position="top">
              <span
                aria-label={`${effectiveBadgeCount} active`}
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[11px] font-bold shrink-0"
              >
                {effectiveBadgeCount > 9 ? '9+' : effectiveBadgeCount}
              </span>
            </Tooltip>
          ) : (
            <span
              aria-label="unread"
              className="inline-block w-2 h-2 rounded-full bg-primary shrink-0"
            />
          ))}

          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleParent(item.id)
            }}
            className="shrink-0 p-0.5 rounded hover:bg-surface-tertiary transition-colors"
            aria-label={effectiveExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
            aria-expanded={effectiveExpanded}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${effectiveExpanded ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {effectiveExpanded && (
          <div className="ml-3 mt-0.5 space-y-0.5 pl-3 border-l border-border">
            {item.children!.map((child) => {
              const childActive = isChildActive(child)
              const ChildIcon = child.icon
              return (
                <a
                  key={child.id}
                  href={child.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNav(child.href)
                  }}
                  className={`group flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${childActive ? 'bg-surface-secondary text-primary font-medium' : 'text-text-secondary/80 hover:bg-surface-secondary hover:text-text-primary'}`}
                  aria-current={childActive ? 'page' : undefined}
                >
                  <div className={`w-0.5 h-4 rounded-full shrink-0 ${childActive ? 'bg-primary' : 'bg-transparent'}`} />
                  <ChildIcon className="w-4 h-4 shrink-0 opacity-60" aria-hidden="true" />
                  <span className="text-body-sm truncate">{child.label}</span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  function renderSection(section: Section, isFirst: boolean) {
    const showLabel = !sidebarCollapsed && section.label.length > 0

    const visibleItems = sidebarCollapsed
      ? section.items.filter(i => i.visibleWhenCollapsed)
      : section.items

    if (visibleItems.length === 0) return null

    return (
      <div key={section.id}>
        {!isFirst && showLabel && (
          <div className="px-3 pt-4 pb-1">
            <span className="text-meta text-text-tertiary font-semibold uppercase tracking-wider">
              {section.label}
            </span>
          </div>
        )}
        <div className="space-y-0.5">
          {visibleItems.map(item => renderNavItem(item))}
        </div>
      </div>
    )
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
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-border ${sidebarCollapsed ? 'w-[72px]' : 'w-60'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-200`}
        aria-label="Main navigation"
        data-sidebar-collapsed={sidebarCollapsed}
      >
        <div className="flex items-center gap-3 h-14 px-4 border-b border-border shrink-0">
          <div
            className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-caption font-bold shrink-0"
            aria-hidden="true"
          >
            A
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-body-sm font-semibold text-text-primary truncate">
                ApplyFlow AI
              </span>
              <span className="text-meta text-text-tertiary truncate">
                Career Workspace
              </span>
            </div>
          )}
        </div>

        <div className="px-3 pt-3 pb-2 shrink-0">
          {sidebarCollapsed ? (
            <button
              onClick={() => handleNav('/applications?new=true')}
              className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center mx-auto hover:opacity-90 transition-opacity"
              aria-label="New Application"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => handleNav('/applications?new=true')}
            >
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          )}
        </div>

        <nav className="flex-1 px-2 py-2 overflow-y-auto">
          {sections.map((section, index) => renderSection(section, index === 0))}
        </nav>

        <div className="border-t border-border px-2 py-2 shrink-0 group">
          <div className="flex items-center gap-1">
            <a
              href="/settings"
              onClick={(e) => { e.preventDefault(); handleNav('/settings') }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-text-secondary hover:bg-surface-secondary hover:text-text-primary flex-1 min-w-0"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="text-body-sm truncate opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto overflow-hidden transition-all duration-150">
                Settings
              </span>
            </a>
            <div
              className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg min-w-0"
              title={userName || 'User'}
            >
              <Avatar
                src={userAvatarUrl}
                name={userName}
                size="sm"
                aria-label={userName || 'User avatar'}
              />
              <span className="text-body-sm truncate text-text-primary opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto overflow-hidden transition-all duration-150">
                {userName || 'User'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export type { NavItem as SidebarNavItem }