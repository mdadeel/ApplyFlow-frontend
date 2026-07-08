import { useState, useEffect } from 'react'
import { Avatar } from '../layout/Avatar'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/auth'
import { Button } from '../ui/Button'

export function AvatarUploader() {
  const { user, setUser } = useAuthStore()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview(null)
  }, [file])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.type.startsWith('image/')) setFile(f)
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const resp = await authService.uploadAvatar(file)
      const fresh = await authService.getMe()
      setUser({ ...fresh, avatarUrl: resp.url })
    } finally {
      setUploading(false)
      setFile(null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar src={preview || user?.avatarUrl} name={user?.name} size="lg" className="cursor-pointer" />
      <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} aria-label="Upload avatar" />
      {file && (
        <Button onClick={upload} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      )}
    </div>
  )
}
