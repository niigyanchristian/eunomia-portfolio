import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import './Navbar.css'

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        <div className="navbar-actions">
          <ThemeToggle />
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
        </div>
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
        </ul>
      </div>
      {isMobileMenuOpen && (
        <div className="navbar-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  )
}
