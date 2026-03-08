import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth'
import { auth } from '../config/firebase'

const FAILED_ATTEMPTS_KEY = 'auth_failed_attempts'
const LAST_ATTEMPT_KEY = 'auth_last_attempt_time'

function getFailedAttempts() {
  try {
    return parseInt(sessionStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function setFailedAttempts(count) {
  try {
    sessionStorage.setItem(FAILED_ATTEMPTS_KEY, String(count))
  } catch {
    // ignore storage errors
  }
}

function setLastAttemptTime(time) {
  try {
    sessionStorage.setItem(LAST_ATTEMPT_KEY, String(time))
  } catch {
    // ignore storage errors
  }
}

function getLastAttemptTime() {
  try {
    return parseInt(sessionStorage.getItem(LAST_ATTEMPT_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function getDelayMs(failedCount) {
  if (failedCount < 3) return 0
  if (failedCount < 5) return 3000
  if (failedCount < 7) return 10000
  return 30000
}

function clearFailedAttempts() {
  try {
    sessionStorage.removeItem(FAILED_ATTEMPTS_KEY)
    sessionStorage.removeItem(LAST_ATTEMPT_KEY)
  } catch {
    // ignore storage errors
  }
}

function logAuthEvent(event, details = {}) {
  console.log(`[Auth] ${event}`, {
    timestamp: new Date().toISOString(),
    ...details,
  })
}

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAuthenticated = currentUser !== null

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    const failedCount = getFailedAttempts()
    const delayMs = getDelayMs(failedCount)

    if (delayMs > 0) {
      const lastAttempt = getLastAttemptTime()
      const elapsed = Date.now() - lastAttempt
      if (elapsed < delayMs) {
        const remaining = Math.ceil((delayMs - elapsed) / 1000)
        const msg = `Too many failed attempts. Please wait ${remaining} seconds.`
        setError(msg)
        logAuthEvent('login_rate_limited', { email, remainingSeconds: remaining })
        throw new Error(msg)
      }
    }

    try {
      await setPersistence(auth, browserLocalPersistence)
      const result = await signInWithEmailAndPassword(auth, email, password)
      clearFailedAttempts()
      setError(null)
      logAuthEvent('login_success', { email, method: 'email' })
      return result
    } catch (err) {
      const newCount = failedCount + 1
      setFailedAttempts(newCount)
      setLastAttemptTime(Date.now())
      const nextDelay = getDelayMs(newCount)
      setError(err.message)
      logAuthEvent('login_failure', {
        email,
        method: 'email',
        error: err.message,
        failedAttempts: newCount,
        nextDelayMs: nextDelay,
      })
      throw err
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      await setPersistence(auth, browserLocalPersistence)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      clearFailedAttempts()
      setError(null)
      logAuthEvent('login_success', { method: 'google', email: result.user.email })
      return result
    } catch (err) {
      setError(err.message)
      logAuthEvent('login_failure', { method: 'google', error: err.message })
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await auth.signOut()
      setError(null)
      logAuthEvent('logout', { method: 'current_device' })
    } catch (err) {
      setError(err.message)
      logAuthEvent('logout_failure', { error: err.message })
      throw err
    }
  }, [])

  const signOutAllDevices = useCallback(async () => {
    try {
      if (currentUser) {
        await currentUser.getIdToken(true)
      }
      await auth.signOut()
      setError(null)
      logAuthEvent('logout', { method: 'all_devices' })
    } catch (err) {
      setError(err.message)
      logAuthEvent('logout_failure', { method: 'all_devices', error: err.message })
      throw err
    }
  }, [currentUser])

  const enableMFA = useCallback(async () => {
    logAuthEvent('mfa_enable_requested')
    throw new Error('MFA is not yet implemented. This feature is coming soon.')
  }, [])

  const disableMFA = useCallback(async () => {
    logAuthEvent('mfa_disable_requested')
    throw new Error('MFA is not yet implemented. This feature is coming soon.')
  }, [])

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    signOutAllDevices,
    enableMFA,
    disableMFA,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
