import { useProfile } from '../../context/ProfileContext'
import './ProfilePreview.css'

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
    // invalid URL
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

export const ProfilePreview = () => {
  const { profile } = useProfile()
  const links = normalizeLinks(profile.socialLinks).filter((link) => link.url)

  return (
    <div className="profile-preview" data-testid="profile-preview">
      <div className="profile-preview-photo">
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt="Profile photo" className="profile-preview-img" />
        ) : (
          <svg
            className="profile-preview-placeholder"
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
      </div>

      <h2 className="profile-preview-name">{profile.name || 'No name set'}</h2>

      {profile.headline && (
        <p className="profile-preview-headline">{profile.headline}</p>
      )}

      {profile.bio && (
        <p className="profile-preview-bio">{profile.bio}</p>
      )}

      {profile.location && (
        <p className="profile-preview-field">
          <span className="profile-preview-label">Location:</span> {profile.location}
        </p>
      )}

      {profile.email && (
        <p className="profile-preview-field">
          <span className="profile-preview-label">Email:</span> {profile.email}
        </p>
      )}

      {profile.phone && (
        <p className="profile-preview-field">
          <span className="profile-preview-label">Phone:</span> {profile.phone}
        </p>
      )}

      {profile.website && (
        <p className="profile-preview-field">
          <span className="profile-preview-label">Website:</span> {profile.website}
        </p>
      )}

      {links.length > 0 && (
        <div className="profile-preview-social">
          <span className="profile-preview-label">Social Links:</span>
          <ul className="profile-preview-links">
            {links.map((link, index) => (
              <li key={index}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {detectPlatform(link.url)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <div className="profile-preview-skills">
          <span className="profile-preview-label">Skills:</span>
          <div className="profile-preview-tags">
            {profile.skills.map((skill) => (
              <span key={skill} className="profile-preview-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
