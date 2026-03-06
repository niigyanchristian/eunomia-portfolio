import './Skills.css'

export const Skills = () => {
  const skillsData = {
    Frontend: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'TypeScript',
      'React',
      'Vue.js',
      'Redux',
      'Tailwind CSS',
      'Material-UI',
      'Responsive Design'
    ],
    Backend: [
      'Node.js',
      'Express',
      'Python',
      'Django',
      'Flask',
      'REST APIs',
      'GraphQL',
      'PostgreSQL',
      'MongoDB',
      'MySQL'
    ],
    Tools: [
      'Git',
      'GitHub',
      'VS Code',
      'Docker',
      'Webpack',
      'Vite',
      'npm',
      'Jest',
      'Postman',
      'Figma'
    ]
  }

  return (
    <section className="skills">
      <div className="skills-container">
        <h1>My Skills</h1>
        <p className="skills-intro">Technologies and tools I work with to build modern web applications.</p>

        <div className="skills-categories">
          {Object.entries(skillsData).map(([category, skills]) => (
            <div key={category} className="skill-category">
              <h2 className="category-title">{category}</h2>
              <div className="skills-list">
                {skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
