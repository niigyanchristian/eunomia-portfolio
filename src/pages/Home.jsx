import { useNavigate } from 'react-router-dom'
import './Home.css'

export const Home = () => {
  const navigate = useNavigate()

  const handleCTAClick = () => {
    navigate('/contact')
  }

  return (
    <section className="home">
      <div className="home-container">
        <div className="hero">
          <h1 className="hero-title">John Doe</h1>
          <h2 className="hero-subtitle">Full Stack Developer & UI/UX Enthusiast</h2>
          <p className="hero-summary">
            Passionate about building elegant, performant web applications that solve real-world problems.
            Specializing in modern JavaScript frameworks, responsive design, and user-centered development.
          </p>
          <button className="cta-button" onClick={handleCTAClick} aria-label="Get in touch">
            Get In Touch
          </button>
        </div>
      </div>
    </section>
  )
}
