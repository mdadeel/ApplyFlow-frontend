import { createContext, useContext } from 'react'

export interface LayoutContextType {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (open: boolean) => void
}

export const LayoutContext = createContext<LayoutContextType | null>(null)

export function useLayout(): LayoutContextType {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
