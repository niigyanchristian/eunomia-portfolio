import { useState, useRef, useEffect } from 'react'
import './SkillsInput.css'

const PREDEFINED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
  'Python', 'Java', 'CSS', 'HTML', 'GraphQL', 'REST API',
  'Git', 'Docker', 'AWS', 'SQL', 'MongoDB', 'PostgreSQL',
  'Redis', 'Next.js', 'Tailwind CSS', 'Jest', 'Figma', 'DevOps', 'CI/CD',
]

export const SkillsInput = ({ skills, onChange }) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const suggestions = inputValue.trim()
    ? PREDEFINED_SKILLS.filter(
        (s) =>
          s.toLowerCase().includes(inputValue.toLowerCase()) &&
          !skills.includes(s)
      )
    : []

  const addSkill = (skill) => {
    if (!skills.includes(skill)) {
      onChange([...skills, skill])
    }
    setInputValue('')
    setIsOpen(false)
  }

  const removeSkill = (skill) => {
    onChange(skills.filter((s) => s !== skill))
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setIsOpen(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) {
        addSkill(suggestions[0])
      } else if (inputValue.trim()) {
        const match = PREDEFINED_SKILLS.find(
          (s) => s.toLowerCase() === inputValue.trim().toLowerCase()
        )
        if (match) addSkill(match)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setInputValue('')
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="skills-input" ref={containerRef}>
      <div className="skills-tags">
        {skills.map((skill) => (
          <span key={skill} className="skill-tag">
            {skill}
            <button
              type="button"
              className="skill-tag-remove"
              aria-label={`Remove ${skill}`}
              onClick={() => removeSkill(skill)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="skills-text-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.trim() && setIsOpen(true)}
          placeholder={skills.length === 0 ? 'Type to search skills…' : ''}
          aria-label="Add skill"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="skills-dropdown" role="listbox" aria-label="Skill suggestions">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              role="option"
              className="skills-dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault()
                addSkill(suggestion)
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
