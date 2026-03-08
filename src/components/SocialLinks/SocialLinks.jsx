import { useState } from 'react'
import { useProfile } from '../../context/ProfileContext'
import './SocialLinks.css'

const MAX_LINKS = 10

function detectPlatform(url) {
  if (!url) return 'Link'
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    if (hostname.includes('github.com')) return 'GitHub'
    if (hostname.includes('linkedin.com')) return 'LinkedIn'
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X'
    if (hostname.includes('instagram.com')) return 'Instagram'
    if (hostname.includes('youtube.com')) return 'YouTube'
    if (hostname.includes('facebook.com')) return 'Facebook'
    if (hostname.includes('dribbble.com')) return 'Dribbble'
    if (hostname.includes('behance.net')) return 'Behance'
    if (hostname.includes('stackoverflow.com')) return 'Stack Overflow'
    if (hostname.includes('dev.to')) return 'Dev.to'
  } catch {
    // invalid URL — fall through to default
  }
  return 'Link'
}

function normalizeLinks(socialLinks) {
  if (Array.isArray(socialLinks)) return socialLinks
  if (socialLinks && typeof socialLinks === 'object') {
    const values = Object.values(socialLinks).filter(Boolean)
    if (values.length > 0) return values.map((url) => ({ url }))
  }
  return []
}

export const SocialLinks = () => {
  const { profile, saveProfile } = useProfile()
  const [links, setLinks] = useState(() => normalizeLinks(profile.socialLinks))

  const save = (updatedLinks) => {
    saveProfile({ ...profile, socialLinks: updatedLinks })
  }

  const handleAdd = () => {
    if (links.length >= MAX_LINKS) return
    const updated = [...links, { url: '' }]
    setLinks(updated)
    save(updated)
  }

  const handleRemove = (index) => {
    const updated = links.filter((_, i) => i !== index)
    setLinks(updated)
    save(updated)
  }

  const handleChange = (index, value) => {
    const updated = links.map((link, i) => (i === index ? { url: value } : link))
    setLinks(updated)
  }

  const handleBlur = () => {
    save(links)
  }

  return (
    <div className="social-links">
      <span className="social-links-label">Social Links</span>
      {links.map((link, index) => (
        <div key={index} className="social-link-row">
          <span className="platform-label">{detectPlatform(link.url)}</span>
          <input
            type="url"
            value={link.url}
            onChange={(e) => handleChange(index, e.target.value)}
            onBlur={handleBlur}
            placeholder="https://..."
            aria-label={`Social link ${index + 1}`}
          />
          <button
            type="button"
            className="btn-remove-link"
            onClick={() => handleRemove(index)}
            aria-label={`Remove link ${index + 1}`}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-add-link"
        onClick={handleAdd}
        disabled={links.length >= MAX_LINKS}
      >
        Add Link
      </button>
    </div>
  )
}
