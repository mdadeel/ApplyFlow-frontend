import { useState, useEffect } from 'react'
import { getInitials } from '../../lib/format'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

const sizeMap = {
  sm: 'w-8 h-8 text-caption',
  md: 'w-12 h-12 text-body-sm',
  lg: 'w-24 h-24 text-headline-md',
}

export function Avatar({ src, name, size = 'md', className = '', onClick }: AvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (src && src.startsWith('blob:')) {
      setPreviewUrl(src)
      return () => URL.revokeObjectURL(src)
    }
    setPreviewUrl(null)
  }, [src])

  const display = previewUrl || src
  const initials = name ? getInitials(name) : '?'

  return (
    <div
      className={`
        relative rounded-full bg-surface-tertiary border border-border
        flex items-center justify-center overflow-hidden
        text-text-primary font-semibold shrink-0
        ${sizeMap[size]} ${className} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={name ? `${name}'s avatar` : 'User avatar'}
    >
      {display ? (
        <img
          src={display}
          alt={name || 'User'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}

      {onClick && (
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="text-white text-label-sm">Upload</span>
        </div>
      )}
    </div>
  )
}

export default Avatar
