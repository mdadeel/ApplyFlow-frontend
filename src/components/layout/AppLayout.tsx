import { type ReactNode } from 'react'
import { LayoutProvider } from './LayoutContext'
import { ToastProvider, ToastContainer } from './ToastContext'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppLayoutProps {
  children: ReactNode
  onSearch?: (value: string) => void
  searchValue?: string
}

function LayoutShell({ children, onSearch, searchValue }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar onSearch={onSearch} searchValue={searchValue} />
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <LayoutProvider>
      <ToastProvider>
        <LayoutShell {...props} />
      </ToastProvider>
    </LayoutProvider>
  )
}
