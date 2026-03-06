import './About.css'

export const About = () => {
  const handleResumeDownload = () => {
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = 'John_Doe_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="about">
      <div className="about-container">
        <h1 className="about-title">About Me</h1>

        <article className="about-intro">
          <h2>Hello, I'm John Doe</h2>
          <p>
            I'm a passionate Full Stack Developer with a keen eye for design and a drive to create
            exceptional digital experiences. With years of experience in web development, I've helped
            businesses and individuals bring their ideas to life through clean, efficient code and
            intuitive user interfaces.
          </p>
        </article>

        <article className="about-background">
          <h2>Background</h2>
          <p>
            My journey in tech started during college, where I discovered my love for problem-solving
            through code. Since then, I've worked on diverse projects ranging from e-commerce platforms
            to interactive web applications. I believe in continuous learning and staying current with
            the latest technologies and best practices.
          </p>
          <p>
            When I'm not coding, you'll find me exploring new technologies, contributing to open-source
            projects, or sharing knowledge with the developer community through blog posts and tutorials.
          </p>
        </article>

        <article className="about-experience">
          <h2>Experience Summary</h2>
          <div className="experience-list">
            <div className="experience-item">
              <h3>Frontend Development</h3>
              <p>
                Proficient in React, Vue.js, and modern JavaScript. Experienced in building responsive,
                accessible, and performant user interfaces with a focus on user experience.
              </p>
            </div>
            <div className="experience-item">
              <h3>Backend Development</h3>
              <p>
                Skilled in Node.js, Express, and RESTful API design. Experience with database design
                and optimization, authentication systems, and server-side architecture.
              </p>
            </div>
            <div className="experience-item">
              <h3>UI/UX Design</h3>
              <p>
                Strong understanding of design principles, typography, and color theory. Capable of
                translating designs into pixel-perfect implementations while maintaining usability.
              </p>
            </div>
          </div>
        </article>

        <div className="about-cta">
          <button
            className="resume-download-button"
            onClick={handleResumeDownload}
            aria-label="Download resume"
          >
            Download Resume
          </button>
        </div>
      </div>
    </section>
  )
}
