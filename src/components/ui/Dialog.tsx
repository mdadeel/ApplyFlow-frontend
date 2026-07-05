import { AlertTriangle } from '../../lib/icons';
import { Modal } from './Modal';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}

export function Dialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'primary' }: DialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        {variant === 'danger' && <AlertTriangle className="h-8 w-8 text-error" />}
        <h3 className="font-headline-md text-on-surface">{title}</h3>
        <p className="text-body-md text-on-surface-variant">{message}</p>
        <div className="flex gap-3 mt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
