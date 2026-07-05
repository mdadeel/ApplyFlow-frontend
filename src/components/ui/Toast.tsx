import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from '../../lib/icons';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
}

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; bg: string; border: string; iconColor: string }> = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', iconColor: 'text-emerald-600' },
  error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', iconColor: 'text-red-600' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-600' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-600' },
};

export function Toast({ open, message, variant = 'info', onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${config.bg} ${config.border} min-w-[320px] max-w-[480px] transition-all duration-300 ease-out
        ${open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
      <p className="flex-1 text-body-md text-on-surface">{message}</p>
      <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
