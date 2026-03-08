import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Account.css'

export const Account = () => {
  const { currentUser, signOut, signOutAllDevices } = useAuth()
  const navigate = useNavigate()
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await signOut()
      navigate('/')
    } catch (err) {
      setError('Failed to logout. Please try again.')
      setLoading(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      await signOutAllDevices()
      setShowLogoutAllConfirm(false)
      navigate('/')
    } catch (err) {
      setError('Failed to logout from all devices. Please try again.')
      setLoading(false)
    }
  }

  const getLoginTime = () => {
    if (currentUser?.metadata?.lastSignInTime) {
      return new Date(currentUser.metadata.lastSignInTime).toLocaleString()
    }
    return 'Unknown'
  }

  const getCreationTime = () => {
    if (currentUser?.metadata?.creationTime) {
      return new Date(currentUser.metadata.creationTime).toLocaleString()
    }
    return 'Unknown'
  }

  const getProviderName = (providerId) => {
    const providerMap = {
      'password': 'Email/Password',
      'google.com': 'Google',
      'github.com': 'GitHub',
      'facebook.com': 'Facebook',
    }
    return providerMap[providerId] || providerId
  }

  if (!currentUser) {
    return (
      <div className="account-page">
        <div className="account-container">
          <h1 className="account-title">Account Settings</h1>
          <p className="account-error">Please log in to view your account settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <h1 className="account-title">Account Settings</h1>

        {error && <div className="account-error-banner">{error}</div>}

        <section className="account-section">
          <h2 className="account-section-title">Profile Information</h2>
          <div className="account-info-grid">
            <div className="account-info-item">
              <span className="account-info-label">Email:</span>
              <span className="account-info-value">{currentUser.email}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">User ID:</span>
              <span className="account-info-value account-info-value-mono">{currentUser.uid}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Email Verified:</span>
              <span className={`account-info-badge ${currentUser.emailVerified ? 'verified' : 'unverified'}`}>
                {currentUser.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </section>

        <section className="account-section">
          <h2 className="account-section-title">Session Information</h2>
          <div className="account-info-grid">
            <div className="account-info-item">
              <span className="account-info-label">Last Login:</span>
              <span className="account-info-value">{getLoginTime()}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Account Created:</span>
              <span className="account-info-value">{getCreationTime()}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Login Method:</span>
              <span className="account-info-value">
                {currentUser.providerData?.map(provider => getProviderName(provider.providerId)).join(', ') || 'Unknown'}
              </span>
            </div>
          </div>
        </section>

        <section className="account-section">
          <h2 className="account-section-title">Security</h2>
          <div className="account-security-actions">
            <div className="account-security-item">
              <div className="account-security-info">
                <h3 className="account-security-subtitle">Multi-Factor Authentication (MFA)</h3>
                <p className="account-security-description">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <button className="account-button account-button-secondary" disabled>
                Coming Soon
              </button>
            </div>

            <div className="account-security-item">
              <div className="account-security-info">
                <h3 className="account-security-subtitle">Logout Current Device</h3>
                <p className="account-security-description">
                  Sign out from this device only.
                </p>
              </div>
              <button
                className="account-button account-button-primary"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            <div className="account-security-item">
              <div className="account-security-info">
                <h3 className="account-security-subtitle">Logout All Devices</h3>
                <p className="account-security-description">
                  Sign out from all devices where you&apos;re currently logged in. You&apos;ll need to log in again on all devices.
                </p>
              </div>
              {!showLogoutAllConfirm ? (
                <button
                  className="account-button account-button-danger"
                  onClick={() => setShowLogoutAllConfirm(true)}
                  disabled={loading}
                >
                  Logout All Devices
                </button>
              ) : (
                <div className="account-confirm-actions">
                  <button
                    className="account-button account-button-danger-confirm"
                    onClick={handleLogoutAllDevices}
                    disabled={loading}
                  >
                    {loading ? 'Logging out...' : 'Confirm Logout All'}
                  </button>
                  <button
                    className="account-button account-button-secondary"
                    onClick={() => setShowLogoutAllConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
