import { type ReactNode } from 'react'

type GridCols = 2 | 3 | 4 | 12

interface BentoGridProps {
  children: ReactNode
  cols?: GridCols
  className?: string
}

const colMap: Record<GridCols, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  12: 'md:grid-cols-12',
}

export function BentoGrid({
  children,
  cols = 2,
  className = '',
}: BentoGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-lg ${colMap[cols]} ${className}`}
    >
      {children}
    </div>
  )
}
