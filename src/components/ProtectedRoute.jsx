import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ProtectedRoute.css'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="protected-route-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
