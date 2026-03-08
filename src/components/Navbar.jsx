import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false)
  const { isAuthenticated, currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const reportsDropdownRef = useRef(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleReportsDropdown = () => {
    setIsReportsDropdownOpen(!isReportsDropdownOpen)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setIsDropdownOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (reportsDropdownRef.current && !reportsDropdownRef.current.contains(event.target)) {
        setIsReportsDropdownOpen(false)
      }
    }

    if (isDropdownOpen || isReportsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, isReportsDropdownOpen])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Portfolio
        </Link>
        <button
          className="navbar-hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <ul className={`navbar-menu ${isMobileMenuOpen ? 'navbar-menu-open' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link" onClick={closeMobileMenu}>
              About
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/projects" className="navbar-link" onClick={closeMobileMenu}>
              Projects
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/skills" className="navbar-link" onClick={closeMobileMenu}>
              Skills
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/contact" className="navbar-link" onClick={closeMobileMenu}>
              Contact
            </Link>
          </li>
          {isAuthenticated && (
            <li className="navbar-item navbar-dropdown-item" ref={reportsDropdownRef}>
              <button
                className="navbar-link navbar-dropdown-trigger"
                onClick={toggleReportsDropdown}
                aria-expanded={isReportsDropdownOpen}
                aria-haspopup="true"
              >
                Reports ▾
              </button>
              {isReportsDropdownOpen && (
                <div className="navbar-dropdown-menu">
                  <Link
                    to="/reports"
                    className="navbar-dropdown-link"
                    onClick={() => {
                      setIsReportsDropdownOpen(false)
                      closeMobileMenu()
                    }}
                  >
                    View Reports
                  </Link>
                  <Link
                    to="/reports/builder"
                    className="navbar-dropdown-link"
                    onClick={() => {
                      setIsReportsDropdownOpen(false)
                      closeMobileMenu()
                    }}
                  >
                    Build Custom Report
                  </Link>
                  <Link
                    to="/reports/schedules"
                    className="navbar-dropdown-link"
                    onClick={() => {
                      setIsReportsDropdownOpen(false)
                      closeMobileMenu()
                    }}
                  >
                    Manage Schedules
                  </Link>
                </div>
              )}
            </li>
          )}
          {!isAuthenticated && (
            <li className="navbar-item">
              <Link to="/profile" className="navbar-link" onClick={closeMobileMenu}>
                Profile
              </Link>
            </li>
          )}
          <li className="navbar-item">
            <Link to="/projects-manager" className="navbar-link" onClick={closeMobileMenu}>
              Manage Projects
            </Link>
          </li>
          {!isAuthenticated && (
            <li className="navbar-item">
              <Link to="/login" className="navbar-link navbar-link-login" onClick={closeMobileMenu}>
                Login
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <li className="navbar-item navbar-user-menu" ref={dropdownRef}>
              <button
                className="navbar-user-button"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <span className="navbar-user-avatar">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="navbar-user-email">{currentUser?.email}</span>
              </button>
              {isDropdownOpen && (
                <div className="navbar-dropdown">
                  <Link
                    to="/account"
                    className="navbar-dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false)
                      closeMobileMenu()
                    }}
                  >
                    Account Settings
                  </Link>
                  <button
                    className="navbar-dropdown-item navbar-dropdown-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
      {isMobileMenuOpen && (
        <div className="navbar-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  )
}
