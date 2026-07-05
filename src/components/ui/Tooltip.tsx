import type { ReactNode } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: TooltipPosition;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <div className="relative inline-flex group">
      {children}
      <div
        className={`absolute ${positionStyles[position]} z-50 px-2 py-1 rounded-lg text-label-sm text-white bg-gray-900 whitespace-nowrap
          invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none`}
      >
        {content}
      </div>
    </div>
  );
}
