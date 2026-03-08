import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'portfolio_profile'

const defaultProfile = {
  name: '',
  headline: '',
  bio: '',
  location: '',
  email: '',
  phone: '',
  website: '',
  photoUrl: '',
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: '',
  },
  skills: [],
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultProfile, ...JSON.parse(stored) }
    }
  } catch {
    // ignore parse errors
  }
  return defaultProfile
}

export const ProfileContext = createContext(null)

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => loadFromStorage())

  const saveProfile = (data) => {
    const updated = { ...defaultProfile, ...data }
    setProfile(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <ProfileContext.Provider value={{ profile, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const ctx = useContext(ProfileContext)
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return ctx
}
