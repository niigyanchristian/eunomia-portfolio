import './Projects.css'

export const Projects = () => {
  const projectsData = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform with user authentication, product management, shopping cart, and payment integration.',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
      liveDemo: 'https://example.com/ecommerce',
      github: 'https://github.com/username/ecommerce-platform'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      technologies: ['React', 'TypeScript', 'Firebase', 'Material-UI'],
      liveDemo: 'https://example.com/taskmanager',
      github: 'https://github.com/username/task-manager'
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      description: 'A weather dashboard that displays current weather conditions and forecasts using external API integration with beautiful visualizations.',
      technologies: ['Vue.js', 'Vuex', 'Chart.js', 'OpenWeather API'],
      liveDemo: 'https://example.com/weather',
      github: 'https://github.com/username/weather-dashboard'
    },
    {
      id: 4,
      title: 'Social Media App',
      description: 'A social networking platform with posts, comments, likes, user profiles, and real-time messaging functionality.',
      technologies: ['React', 'Redux', 'Socket.io', 'PostgreSQL'],
      liveDemo: 'https://example.com/social',
      github: 'https://github.com/username/social-media-app'
    }
  ]

  return (
    <section className="projects">
      <div className="projects-container">
        <h1>My Projects</h1>
        <p className="projects-intro">Here are some of my recent projects that showcase my skills and experience.</p>

        <div className="projects-grid">
          {projectsData.map(project => (
            <div key={project.id} className="project-card">
              <h2 className="project-title">{project.title}</h2>
              <p className="project-description">{project.description}</p>

              <div className="project-technologies">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>

              <div className="project-links">
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link demo-link"
                >
                  Live Demo
                </a>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link github-link"
                >
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
