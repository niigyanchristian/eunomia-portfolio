import { useRef, useState } from 'react'
import { useProfile } from '../../context/ProfileContext'
import './ProfilePhoto.css'

const PHOTO_SIZE = 400

function resizeImageToSquare(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const size = Math.min(img.width, img.height)
        const offsetX = (img.width - size) / 2
        const offsetY = (img.height - size) / 2

        const canvas = document.createElement('canvas')
        canvas.width = PHOTO_SIZE
        canvas.height = PHOTO_SIZE

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, PHOTO_SIZE, PHOTO_SIZE)

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const ProfilePhoto = () => {
  const { profile, saveProfile } = useProfile()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      const dataUrl = await resizeImageToSquare(file)
      saveProfile({ ...profile, photoUrl: dataUrl })
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="profile-photo">
      <div className="profile-photo-wrapper">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt="Profile photo"
            className="profile-photo-img"
          />
        ) : (
          <svg
            className="profile-photo-placeholder"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Default avatar"
            role="img"
          >
            <circle cx="50" cy="50" r="50" fill="#e2e8f0" />
            <circle cx="50" cy="38" r="18" fill="#94a3b8" />
            <ellipse cx="50" cy="85" rx="28" ry="20" fill="#94a3b8" />
          </svg>
        )}

        {loading && (
          <div className="profile-photo-loading" aria-label="Processing image">
            <span className="profile-photo-spinner" />
          </div>
        )}

        {!loading && (
          <button
            className="profile-photo-overlay"
            onClick={handleUploadClick}
            aria-label="Upload photo"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload Photo</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="profile-photo-input"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
