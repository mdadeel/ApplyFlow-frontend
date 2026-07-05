import { createContext, useContext, useMemo } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void
  toasts: Toast[]
  dismissToast: (id: string) => void
}

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return useMemo(
    () => ({ showToast: ctx.showToast, toasts: ctx.toasts, dismissToast: ctx.dismissToast }),
    [ctx.showToast, ctx.toasts, ctx.dismissToast],
  )
}
