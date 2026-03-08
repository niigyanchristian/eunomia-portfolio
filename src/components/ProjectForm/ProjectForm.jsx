import { useState } from 'react'
import './ProjectForm.css'

const DESC_MAX = 2000
const CATEGORIES = ['Web Development', 'Mobile App', 'Design', 'Data Science', 'Other']
const PROJECT_TYPES = ['Personal', 'Client Work', 'Collaborative']

const emptyProject = {
  title: '',
  description: '',
  completionDate: '',
  category: '',
  customTags: [],
  projectType: '',
  collaborators: [],
}

function validateDraft(data) {
  const errors = {}
  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters'
  }
  if (data.title && data.title.length > 100) {
    errors.title = 'Title must be 100 characters or fewer'
  }
  return errors
}

function validatePublish(data) {
  const errors = validateDraft(data)
  if (!data.description || data.description.trim().length < 50) {
    errors.description = 'Description must be at least 50 characters for publishing'
  }
  if (data.description && data.description.length > DESC_MAX) {
    errors.description = `Description must be ${DESC_MAX} characters or fewer`
  }
  if (!data.category) {
    errors.category = 'Category is required for publishing'
  }
  if (!data.projectType) {
    errors.projectType = 'Project type is required for publishing'
  }
  if (data.completionDate) {
    const selected = new Date(data.completionDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (selected > today) {
      errors.completionDate = 'Completion date cannot be in the future'
    }
  }
  return errors
}

function getInitialForm(project) {
  if (!project) return emptyProject
  return {
    title: project.title || '',
    description: project.description || '',
    completionDate: project.completionDate || '',
    category: project.category || '',
    customTags: project.customTags || [],
    projectType: project.projectType || '',
    collaborators: project.collaborators || [],
  }
}

export const ProjectForm = ({ project, onSaveDraft, onPublish, onCancel }) => {
  const isEditMode = Boolean(project)
  const [form, setForm] = useState(() => getInitialForm(project))
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})
  const [collabName, setCollabName] = useState('')
  const [collabRole, setCollabRole] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'description' && value.length > DESC_MAX) return
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !form.customTags.includes(tag)) {
        setForm((prev) => ({ ...prev, customTags: [...prev.customTags, tag] }))
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      customTags: prev.customTags.filter((t) => t !== tag),
    }))
  }

  const handleAddCollaborator = () => {
    if (!collabName.trim()) return
    setForm((prev) => ({
      ...prev,
      collaborators: [...prev.collaborators, { name: collabName.trim(), role: collabRole.trim() }],
    }))
    setCollabName('')
    setCollabRole('')
  }

  const handleRemoveCollaborator = (index) => {
    setForm((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }))
  }

  const handleSaveDraft = () => {
    const validationErrors = validateDraft(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    onSaveDraft({ ...form, status: 'draft' })
  }

  const handlePublish = () => {
    const validationErrors = validatePublish(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    onPublish({ ...form, status: 'published' })
  }

  return (
    <div className="project-form">
      <h2 className="project-form-title">
        {isEditMode ? 'Edit Project' : 'Create New Project'}
      </h2>

      <form onSubmit={(e) => e.preventDefault()} aria-label="Project form">
        <div className="form-group">
          <label htmlFor="project-title">Title *</label>
          <input
            id="project-title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Project title (3-100 characters)"
            maxLength={100}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="project-description">Description</label>
          <textarea
            id="project-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your project (min 50 chars for publishing)"
            maxLength={DESC_MAX}
          />
          <span
            className={`char-counter${form.description.length >= DESC_MAX ? ' at-limit' : ''}`}
            aria-live="polite"
          >
            {form.description.length}/{DESC_MAX}
          </span>
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="project-completion-date">Completion Date</label>
          <input
            id="project-completion-date"
            name="completionDate"
            type="date"
            value={form.completionDate}
            onChange={handleChange}
          />
          {errors.completionDate && <span className="form-error">{errors.completionDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="project-category">Category</label>
          <select
            id="project-category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="form-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label>Custom Tags</label>
          <div className="tags-input-container">
            <div className="tags-list">
              {form.customTags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
              aria-label="Add tag"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Project Type</label>
          <div className="radio-group" role="radiogroup" aria-label="Project type">
            {PROJECT_TYPES.map((type) => (
              <label key={type} className="radio-label">
                <input
                  type="radio"
                  name="projectType"
                  value={type}
                  checked={form.projectType === type}
                  onChange={handleChange}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
          {errors.projectType && <span className="form-error">{errors.projectType}</span>}
        </div>

        <div className="form-group">
          <label>Collaborators</label>
          <div className="collaborators-section">
            {form.collaborators.length > 0 && (
              <ul className="collaborators-list">
                {form.collaborators.map((collab, index) => (
                  <li key={index} className="collaborator-item">
                    <span className="collaborator-info">
                      <strong>{collab.name}</strong>
                      {collab.role && <span> — {collab.role}</span>}
                    </span>
                    <button
                      type="button"
                      className="collaborator-remove"
                      aria-label={`Remove collaborator ${collab.name}`}
                      onClick={() => handleRemoveCollaborator(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="collaborator-inputs">
              <input
                type="text"
                value={collabName}
                onChange={(e) => setCollabName(e.target.value)}
                placeholder="Name"
                aria-label="Collaborator name"
              />
              <input
                type="text"
                value={collabRole}
                onChange={(e) => setCollabRole(e.target.value)}
                placeholder="Role"
                aria-label="Collaborator role"
              />
              <button
                type="button"
                className="btn-add-collab"
                onClick={handleAddCollaborator}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="project-form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-draft" onClick={handleSaveDraft}>
            Save as Draft
          </button>
          <button type="button" className="btn-publish" onClick={handlePublish}>
            Publish
          </button>
        </div>
      </form>
    </div>
  )
}
