import { type ReactNode } from 'react'
import { LayoutProvider } from './LayoutContext'
import { ToastProvider, ToastContainer } from './ToastContext'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useLayout } from './useLayout'

interface AppLayoutProps {
  children: ReactNode
  onSearch?: (value: string) => void
  searchValue?: string
}

function LayoutShell({ children, onSearch, searchValue }: AppLayoutProps) {
  const { sidebarCollapsed } = useLayout()
  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fc]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar onSearch={onSearch} searchValue={searchValue} />
        <div className={`flex-1 overflow-y-auto p-8 w-full transition-all duration-200 ${sidebarCollapsed ? 'max-w-none px-12' : 'max-w-7xl mx-auto'}`}>
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
