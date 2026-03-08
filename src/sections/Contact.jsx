import { useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import './Contact.css'

export const Contact = () => {
  const { profile } = useProfile()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Using Formspree - replace with your actual Formspree endpoint
      // You can sign up at https://formspree.io and get your form ID
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactEmail = profile.email || ''
  const contactLocation = profile.location || ''

  const socialLinks = [
    profile.socialLinks?.github && { name: 'GitHub', url: profile.socialLinks.github, icon: '🔗' },
    profile.socialLinks?.linkedin && { name: 'LinkedIn', url: profile.socialLinks.linkedin, icon: '💼' },
    profile.socialLinks?.twitter && { name: 'Twitter', url: profile.socialLinks.twitter, icon: '🐦' },
    contactEmail && { name: 'Email', url: `mailto:${contactEmail}`, icon: '📧' },
  ].filter(Boolean)

  return (
    <section className="contact-section">
      <div className="contact-content">
        <div className="contact-header">
          <h2>Get In Touch</h2>
          <p>Have a question or want to work together? Feel free to reach out!</p>
        </div>

        <div className="contact-wrapper">
          <div className="contact-info">
            <div className="info-card">
              <h3>Contact Information</h3>
              {contactEmail ? (
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  <div className="info-text">
                    <strong>Email</strong>
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                  </div>
                </div>
              ) : null}
              {contactLocation ? (
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <div className="info-text">
                    <strong>Location</strong>
                    <p>{contactLocation}</p>
                  </div>
                </div>
              ) : null}
              {!contactEmail && !contactLocation && (
                <p className="info-empty">
                  Update your <a href="/profile">Profile</a> to display contact details here.
                </p>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="social-links">
                <h3>Connect With Me</h3>
                <div className="social-links-grid">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label={link.name}
                    >
                      <span className="social-icon">{link.icon}</span>
                      <span className="social-name">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Your Name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
                placeholder="Your message here..."
                rows="5"
              ></textarea>
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {submitStatus === 'success' && (
              <div className="status-message success">
                Thank you! Your message has been sent successfully.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="status-message error">
                Oops! Something went wrong. Please try again later.
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
