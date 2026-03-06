import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Projects } from '../pages/Projects'
import { Skills } from '../pages/Skills'

describe('Projects Component', () => {
  it('should render the projects section', () => {
    const { container } = render(<Projects />)
    const section = container.querySelector('section.projects')
    expect(section).toBeInTheDocument()
  })

  it('should render the section heading', () => {
    render(<Projects />)
    const heading = screen.getByRole('heading', { level: 1, name: 'My Projects' })
    expect(heading).toBeInTheDocument()
  })

  it('should render the projects intro text', () => {
    render(<Projects />)
    const intro = screen.getByText('Here are some of my recent projects that showcase my skills and experience.')
    expect(intro).toBeInTheDocument()
  })

  it('should render all project cards', () => {
    render(<Projects />)
    const projectTitles = [
      'E-Commerce Platform',
      'Task Management App',
      'Weather Dashboard',
      'Social Media App'
    ]
    projectTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('should render all project descriptions', () => {
    render(<Projects />)
    expect(screen.getByText(/A full-stack e-commerce platform/)).toBeInTheDocument()
    expect(screen.getByText(/A collaborative task management application/)).toBeInTheDocument()
    expect(screen.getByText(/A weather dashboard that displays current weather/)).toBeInTheDocument()
    expect(screen.getByText(/A social networking platform/)).toBeInTheDocument()
  })

  it('should render technology tags for each project', () => {
    const { container } = render(<Projects />)
    const techTags = container.querySelectorAll('.tech-tag')
    expect(techTags.length).toBeGreaterThan(0)
    // Verify some key technologies are present
    const techTexts = Array.from(techTags).map(tag => tag.textContent)
    expect(techTexts).toContain('React')
    expect(techTexts).toContain('Node.js')
    expect(techTexts).toContain('Vue.js')
    expect(techTexts).toContain('Redux')
    expect(techTexts).toContain('MongoDB')
  })

  it('should render demo links for all projects', () => {
    render(<Projects />)
    const demoLinks = screen.getAllByText('Live Demo')
    expect(demoLinks).toHaveLength(4)
    demoLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.href).toBeTruthy()
    })
  })

  it('should render github links for all projects', () => {
    render(<Projects />)
    const githubLinks = screen.getAllByText('GitHub')
    expect(githubLinks).toHaveLength(4)
    githubLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.href).toContain('github.com')
    })
  })

  it('should render projects with correct demo link URLs', () => {
    render(<Projects />)
    const demoLinks = screen.getAllByText('Live Demo')
    expect(demoLinks[0].href).toContain('example.com/ecommerce')
    expect(demoLinks[1].href).toContain('example.com/taskmanager')
    expect(demoLinks[2].href).toContain('example.com/weather')
    expect(demoLinks[3].href).toContain('example.com/social')
  })

  it('should render projects with correct github link URLs', () => {
    render(<Projects />)
    const githubLinks = screen.getAllByText('GitHub')
    expect(githubLinks[0].href).toContain('ecommerce-platform')
    expect(githubLinks[1].href).toContain('task-manager')
    expect(githubLinks[2].href).toContain('weather-dashboard')
    expect(githubLinks[3].href).toContain('social-media-app')
  })

  it('should have projects container with correct class', () => {
    const { container } = render(<Projects />)
    const projectsContainer = container.querySelector('.projects-container')
    expect(projectsContainer).toBeInTheDocument()
  })

  it('should have projects grid with correct class', () => {
    const { container } = render(<Projects />)
    const projectsGrid = container.querySelector('.projects-grid')
    expect(projectsGrid).toBeInTheDocument()
  })

  it('should render project cards with correct classes', () => {
    const { container } = render(<Projects />)
    const projectCards = container.querySelectorAll('.project-card')
    expect(projectCards).toHaveLength(4)
    projectCards.forEach(card => {
      expect(card).toHaveClass('project-card')
    })
  })

  it('should render project titles with correct class', () => {
    const { container } = render(<Projects />)
    const projectTitles = container.querySelectorAll('.project-title')
    expect(projectTitles).toHaveLength(4)
    projectTitles.forEach(title => {
      expect(title).toHaveClass('project-title')
    })
  })

  it('should render project descriptions with correct class', () => {
    const { container } = render(<Projects />)
    const descriptions = container.querySelectorAll('.project-description')
    expect(descriptions).toHaveLength(4)
  })

  it('should render technology tags container', () => {
    const { container } = render(<Projects />)
    const techContainers = container.querySelectorAll('.project-technologies')
    expect(techContainers).toHaveLength(4)
  })

  it('should render tech tags with correct class', () => {
    const { container } = render(<Projects />)
    const techTags = container.querySelectorAll('.tech-tag')
    expect(techTags.length).toBeGreaterThan(0)
    techTags.forEach(tag => {
      expect(tag).toHaveClass('tech-tag')
    })
  })

  it('should render project links container', () => {
    const { container } = render(<Projects />)
    const linkContainers = container.querySelectorAll('.project-links')
    expect(linkContainers).toHaveLength(4)
  })

  it('should render project links with correct classes', () => {
    const { container } = render(<Projects />)
    const demoLinks = container.querySelectorAll('.demo-link')
    const githubLinks = container.querySelectorAll('.github-link')
    expect(demoLinks).toHaveLength(4)
    expect(githubLinks).toHaveLength(4)
  })

  it('should render sections with correct semantic structure', () => {
    const { container } = render(<Projects />)
    const section = container.querySelector('section.projects')
    expect(section).toBeInTheDocument()
  })
})

describe('Skills Component', () => {
  it('should render the skills section', () => {
    const { container } = render(<Skills />)
    const section = container.querySelector('section.skills')
    expect(section).toBeInTheDocument()
  })

  it('should render the section heading', () => {
    render(<Skills />)
    const heading = screen.getByRole('heading', { level: 1, name: 'My Skills' })
    expect(heading).toBeInTheDocument()
  })

  it('should render the skills intro text', () => {
    render(<Skills />)
    const intro = screen.getByText('Technologies and tools I work with to build modern web applications.')
    expect(intro).toBeInTheDocument()
  })

  it('should render all skill categories', () => {
    render(<Skills />)
    const categories = ['Frontend', 'Backend', 'Tools']
    categories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument()
    })
  })

  it('should render all frontend skills', () => {
    render(<Skills />)
    const frontendSkills = [
      'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React',
      'Vue.js', 'Redux', 'Tailwind CSS', 'Material-UI', 'Responsive Design'
    ]
    frontendSkills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument()
    })
  })

  it('should render all backend skills', () => {
    render(<Skills />)
    const backendSkills = [
      'Node.js', 'Express', 'Python', 'Django', 'Flask',
      'REST APIs', 'GraphQL', 'PostgreSQL', 'MongoDB', 'MySQL'
    ]
    backendSkills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument()
    })
  })

  it('should render all tools', () => {
    render(<Skills />)
    const tools = [
      'Git', 'GitHub', 'VS Code', 'Docker', 'Webpack',
      'Vite', 'npm', 'Jest', 'Postman', 'Figma'
    ]
    tools.forEach(tool => {
      expect(screen.getByText(tool)).toBeInTheDocument()
    })
  })

  it('should have skills container with correct class', () => {
    const { container } = render(<Skills />)
    const skillsContainer = container.querySelector('.skills-container')
    expect(skillsContainer).toBeInTheDocument()
  })

  it('should have skills categories container', () => {
    const { container } = render(<Skills />)
    const categoriesContainer = container.querySelector('.skills-categories')
    expect(categoriesContainer).toBeInTheDocument()
  })

  it('should render skill category divs with correct class', () => {
    const { container } = render(<Skills />)
    const categories = container.querySelectorAll('.skill-category')
    expect(categories).toHaveLength(3)
  })

  it('should render category titles with correct class', () => {
    const { container } = render(<Skills />)
    const categoryTitles = container.querySelectorAll('.category-title')
    expect(categoryTitles).toHaveLength(3)
  })

  it('should render skills list containers', () => {
    const { container } = render(<Skills />)
    const skillsLists = container.querySelectorAll('.skills-list')
    expect(skillsLists).toHaveLength(3)
  })

  it('should render individual skill items with correct class', () => {
    const { container } = render(<Skills />)
    const skillItems = container.querySelectorAll('.skill-item')
    expect(skillItems.length).toBe(30) // 10 frontend + 10 backend + 10 tools
  })

  it('should render skill items with correct count per category', () => {
    const { container } = render(<Skills />)
    const skillItems = container.querySelectorAll('.skill-item')
    expect(skillItems).toHaveLength(30)
  })

  it('should have skill categories in correct order', () => {
    const { container } = render(<Skills />)
    const categoryTitles = container.querySelectorAll('.category-title')
    expect(categoryTitles[0]).toHaveTextContent('Frontend')
    expect(categoryTitles[1]).toHaveTextContent('Backend')
    expect(categoryTitles[2]).toHaveTextContent('Tools')
  })

  it('should render section with correct semantic structure', () => {
    const { container } = render(<Skills />)
    const section = container.querySelector('section.skills')
    expect(section).toBeInTheDocument()
  })

  it('should properly categorize frontend skills', () => {
    const { container } = render(<Skills />)
    const skillCategories = container.querySelectorAll('.skill-category')
    const frontendCategory = skillCategories[0]
    const frontendSkills = frontendCategory.querySelectorAll('.skill-item')
    expect(frontendSkills).toHaveLength(10)
  })

  it('should properly categorize backend skills', () => {
    const { container } = render(<Skills />)
    const skillCategories = container.querySelectorAll('.skill-category')
    const backendCategory = skillCategories[1]
    const backendSkills = backendCategory.querySelectorAll('.skill-item')
    expect(backendSkills).toHaveLength(10)
  })

  it('should properly categorize tools', () => {
    const { container } = render(<Skills />)
    const skillCategories = container.querySelectorAll('.skill-category')
    const toolsCategory = skillCategories[2]
    const toolsItems = toolsCategory.querySelectorAll('.skill-item')
    expect(toolsItems).toHaveLength(10)
  })

  it('should render skills with intro class', () => {
    const { container } = render(<Skills />)
    const intro = container.querySelector('.skills-intro')
    expect(intro).toBeInTheDocument()
  })
})
