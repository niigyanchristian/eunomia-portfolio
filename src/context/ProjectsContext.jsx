import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'portfolio_projects'

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore parse errors
  }
  return []
}

function saveToStorage(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export const ProjectsContext = createContext(null)

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => loadFromStorage())

  const addProject = (projectData) => {
    const now = new Date().toISOString()
    const newProject = {
      id: generateId(),
      title: '',
      description: '',
      completionDate: '',
      category: '',
      customTags: [],
      projectType: '',
      collaborators: [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      ...projectData,
    }
    const updated = [...projects, newProject]
    setProjects(updated)
    saveToStorage(updated)
    return newProject
  }

  const updateProject = (id, projectData) => {
    const updated = projects.map((p) =>
      p.id === id
        ? { ...p, ...projectData, updatedAt: new Date().toISOString() }
        : p
    )
    setProjects(updated)
    saveToStorage(updated)
  }

  const deleteProject = (id) => {
    const updated = projects.filter((p) => p.id !== id)
    setProjects(updated)
    saveToStorage(updated)
  }

  const publishProject = (id) => {
    updateProject(id, { status: 'published' })
  }

  const saveDraft = (id) => {
    updateProject(id, { status: 'draft' })
  }

  return (
    <ProjectsContext.Provider
      value={{ projects, addProject, updateProject, deleteProject, publishProject, saveDraft }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export const useProjects = () => {
  const ctx = useContext(ProjectsContext)
  if (!ctx) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return ctx
}
