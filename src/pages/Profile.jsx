import { useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { ProfilePhoto } from '../components/ProfilePhoto/ProfilePhoto'
import { SocialLinks } from '../components/SocialLinks/SocialLinks'
import { SkillsInput } from '../components/SkillsInput/SkillsInput'
import './Profile.css'

const BIO_MAX = 500

export const Profile = () => {
  const { profile, saveProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(profile)

  const handleEdit = () => {
    setDraft(profile)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(profile)
    setIsEditing(false)
  }

  const handleSave = () => {
    saveProfile(draft)
    setIsEditing(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'bio' && value.length > BIO_MAX) return
    setDraft((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <section className="profile">
      <div className="profile-container">
        <h1 className="profile-title">Profile</h1>

        <div className="profile-card">
          <ProfilePhoto />
          {isEditing ? (
            <form
              className="profile-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              aria-label="Edit profile form"
            >
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={draft.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="headline">Headline</label>
                <input
                  id="headline"
                  name="headline"
                  type="text"
                  value={draft.headline}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={draft.bio}
                  onChange={handleChange}
                  placeholder="Tell people about yourself (max 500 characters)"
                  maxLength={BIO_MAX}
                />
                <span
                  className={`bio-counter${draft.bio.length >= BIO_MAX ? ' at-limit' : ''}`}
                  aria-live="polite"
                >
                  {draft.bio.length}/{BIO_MAX}
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={draft.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={draft.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={draft.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={draft.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="form-group">
                <label>Skills</label>
                <SkillsInput
                  skills={draft.skills || []}
                  onChange={(skills) => setDraft((prev) => ({ ...prev, skills }))}
                />
              </div>

              <div className="form-group">
                <SocialLinks />
              </div>

              <div className="profile-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-view">
              <h2>{profile.name || 'No name set'}</h2>
              {profile.headline && <p><span>Headline:</span>{profile.headline}</p>}
              {profile.bio && <p><span>Bio:</span>{profile.bio}</p>}
              {profile.location && <p><span>Location:</span>{profile.location}</p>}
              {profile.email && <p><span>Email:</span>{profile.email}</p>}
              {profile.phone && <p><span>Phone:</span>{profile.phone}</p>}
              {profile.website && <p><span>Website:</span>{profile.website}</p>}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="profile-cta">
            <button className="btn-edit" onClick={handleEdit} aria-label="Edit profile">
              Edit Profile
            </button>
            <button className="btn-preview" aria-label="Preview profile">
              Preview Profile
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
