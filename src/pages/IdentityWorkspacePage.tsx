import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'

const lazyPage = <T extends string>(importFn: () => Promise<{ [K in T]: any }>, name: T) =>
  lazy(() => importFn().then(m => ({ default: m[name] })))
import { AppLayout } from '../components/layout/AppLayout'
import { User, FileText, Settings, FileCheck } from '../lib/icons'

const CareerProfileTab = lazyPage(() => import('./CareerProfileTab'), 'CareerProfileTab')
const ResumeLibraryTab = lazyPage(() => import('./ResumeLibraryTab'), 'ResumeLibraryTab')
const ResumeEditorTab = lazyPage(() => import('./ResumeEditorTab'), 'ResumeEditorTab')
const ResumeStrategyTab = lazyPage(() => import('./ResumeStrategyTab'), 'ResumeStrategyTab')

type TabKey = 'profile' | 'library' | 'editor' | 'strategy'

export function IdentityWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabKey) || 'profile'

  const setTab = (tab: TabKey) => {
    setSearchParams(prev => {
      prev.set('tab', tab)
      return prev
    })
  }

  const navItems = [
    { id: 'profile', label: 'Career Profile', icon: User },
    { id: 'library', label: 'Resume Library', icon: FileCheck },
    { id: 'editor', label: 'Resume Editor', icon: FileText },
    { id: 'strategy', label: 'Targeting Strategy', icon: Settings },
  ] as const

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Title and Tab Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
          <div>
            <h1 className="text-heading-1 font-semibold text-text-primary">{'Identity'}</h1>
            <p className="text-body-sm text-text-secondary mt-1">{'Manage your professional profile and resume targeting strategy'}</p>
          </div>
          
          <nav className="flex flex-wrap items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-border">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-caption font-medium transition-all ${
                    isActive
                      ? 'bg-surface text-primary shadow-sm border border-border/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content Panel */}
        <div className="pt-2">
          <Suspense fallback={<div className="h-64 animate-pulse bg-surface-secondary rounded-xl" />}>
            {currentTab === 'profile' && <CareerProfileTab />}
            {currentTab === 'library' && <ResumeLibraryTab />}
            {currentTab === 'editor' && <ResumeEditorTab />}
            {currentTab === 'strategy' && <ResumeStrategyTab />}
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}
