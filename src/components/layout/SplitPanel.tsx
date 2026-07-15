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
    <div className={`flex flex-col lg:flex-row gap-lg lg:gap-0 ${className}`}>
      <div className="w-full lg:pr-8" style={{ flex: leftWeight }}>
        {left}
      </div>
      
      {/* Subtle Divider for Premium SaaS feel */}
      <div className="hidden lg:block w-px bg-border my-2 mx-8" />
      
      <div className="w-full lg:pl-8" style={{ flex: rightWeight }}>
        {right}
      </div>
    </div>
  )
}
