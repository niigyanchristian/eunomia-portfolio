import { useState } from 'react'
import { useProjects } from '../context/ProjectsContext'
import { ProjectForm } from '../components/ProjectForm/ProjectForm'
import { ProjectCard } from '../components/ProjectCard/ProjectCard'
import './ProjectsManager.css'

const FILTERS = ['All', 'Drafts', 'Published']

export const ProjectsManager = () => {
  const { projects, addProject, updateProject, deleteProject } = useProjects()
  const [activeFilter, setActiveFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'Drafts') return p.status === 'draft'
    if (activeFilter === 'Published') return p.status === 'published'
    return true
  })

  const handleCreate = () => {
    setEditingProject(null)
    setShowForm(true)
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProject(null)
  }

  const handleSaveDraft = (formData) => {
    if (editingProject) {
      updateProject(editingProject.id, formData)
    } else {
      addProject(formData)
    }
    setShowForm(false)
    setEditingProject(null)
  }

  const handlePublish = (formData) => {
    if (editingProject) {
      updateProject(editingProject.id, formData)
    } else {
      addProject(formData)
    }
    setShowForm(false)
    setEditingProject(null)
  }

  const handleDeleteClick = (project) => {
    setDeleteConfirm(project)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteProject(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  const emptyMessages = {
    All: 'No projects yet. Create your first project to get started!',
    Drafts: 'No draft projects. Your saved drafts will appear here.',
    Published: 'No published projects. Publish a project to see it here.',
  }

  return (
    <section className="projects-manager">
      <div className="projects-manager-container">
        <div className="projects-manager-header">
          <h1 className="projects-manager-title">Manage Projects</h1>
          {!showForm && (
            <button className="btn-create-project" onClick={handleCreate}>
              + Create New Project
            </button>
          )}
        </div>

        {showForm ? (
          <ProjectForm
            project={editingProject}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <div className="filter-tabs" role="tablist" aria-label="Project filters">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  role="tab"
                  className={`filter-tab${activeFilter === filter ? ' filter-tab-active' : ''}`}
                  aria-selected={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredProjects.length === 0 ? (
              <div className="projects-empty">
                <p>{emptyMessages[activeFilter]}</p>
              </div>
            ) : (
              <div className="projects-grid">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {deleteConfirm && (
          <div className="delete-overlay" onClick={handleDeleteCancel}>
            <div
              className="delete-dialog"
              role="alertdialog"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-desc"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="delete-dialog-title">Delete Project</h3>
              <p id="delete-dialog-desc">
                Are you sure you want to delete &quot;{deleteConfirm.title}&quot;? This action cannot
                be undone.
              </p>
              <div className="delete-dialog-actions">
                <button className="btn-cancel" onClick={handleDeleteCancel}>
                  Cancel
                </button>
                <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
