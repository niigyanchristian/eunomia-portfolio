import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

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
          <li className="navbar-item">
            <Link to="/profile" className="navbar-link" onClick={closeMobileMenu}>
              Profile
            </Link>
          </li>
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
        </ul>
      </div>
      {isMobileMenuOpen && (
        <div className="navbar-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  )
}
