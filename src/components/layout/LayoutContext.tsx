import { useState, type ReactNode } from 'react'
import { LayoutContext } from './useLayout'

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('applyflow_sidebar_collapsed', String(next))
      } catch {
        // localStorage unavailable
      }
      return next
    })
  }

  return (
    <LayoutContext.Provider
      value={{ sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen }}
    >
      {children}
    </LayoutContext.Provider>
  )
}
