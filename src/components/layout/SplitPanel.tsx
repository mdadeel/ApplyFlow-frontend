import { type ReactNode } from 'react'

interface SplitPanelProps {
  left: ReactNode
  right: ReactNode
  leftWeight?: number
  rightWeight?: number
  className?: string
}

export function SplitPanel({
  left,
  right,
  leftWeight = 1,
  rightWeight = 2,
  className = '',
}: SplitPanelProps) {
  return (
    <div className={`flex flex-col lg:flex-row gap-lg ${className}`}>
      <div className="w-full" style={{ flex: leftWeight }}>
        {left}
      </div>
      <div className="w-full" style={{ flex: rightWeight }}>
        {right}
      </div>
    </div>
  )
}
