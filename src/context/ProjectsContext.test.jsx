import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { useRef, useEffect } from 'react'
import { ProjectsProvider, useProjects } from './ProjectsContext'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const valueHolderRef = { current: null }

const TestConsumer = () => {
  const value = useProjects()
  const holderRef = useRef(valueHolderRef)
  useEffect(() => {
    holderRef.current.current = value
  })
  return <div data-testid="consumer">loaded</div>
}

function renderWithProvider() {
  return render(
    <ProjectsProvider>
      <TestConsumer />
    </ProjectsProvider>
  )
}

describe('ProjectsContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    valueHolderRef.current = null
  })

  it('provides an empty projects array initially', () => {
    renderWithProvider()
    expect(valueHolderRef.current.projects).toEqual([])
  })

  it('loads projects from localStorage', () => {
    const stored = [{ id: '1', title: 'Test', status: 'draft' }]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored))
    renderWithProvider()
    expect(valueHolderRef.current.projects).toEqual(stored)
  })

  it('addProject adds a new project with generated id and timestamps', () => {
    renderWithProvider()
    let result
    act(() => {
      result = valueHolderRef.current.addProject({ title: 'My Project', description: 'A desc' })
    })
    expect(result.id).toBeTruthy()
    expect(result.title).toBe('My Project')
    expect(result.status).toBe('draft')
    expect(result.createdAt).toBeTruthy()
    expect(result.updatedAt).toBeTruthy()
    expect(valueHolderRef.current.projects).toHaveLength(1)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'portfolio_projects',
      expect.stringContaining('My Project')
    )
  })

  it('updateProject updates the specified project', () => {
    renderWithProvider()
    let project
    act(() => {
      project = valueHolderRef.current.addProject({ title: 'Original' })
    })
    act(() => {
      valueHolderRef.current.updateProject(project.id, { title: 'Updated' })
    })
    expect(valueHolderRef.current.projects[0].title).toBe('Updated')
  })

  it('deleteProject removes the specified project', () => {
    renderWithProvider()
    let project
    act(() => {
      project = valueHolderRef.current.addProject({ title: 'To Delete' })
    })
    act(() => {
      valueHolderRef.current.deleteProject(project.id)
    })
    expect(valueHolderRef.current.projects).toHaveLength(0)
  })

  it('publishProject sets status to published', () => {
    renderWithProvider()
    let project
    act(() => {
      project = valueHolderRef.current.addProject({ title: 'Draft Project' })
    })
    act(() => {
      valueHolderRef.current.publishProject(project.id)
    })
    expect(valueHolderRef.current.projects[0].status).toBe('published')
  })

  it('saveDraft sets status to draft', () => {
    renderWithProvider()
    let project
    act(() => {
      project = valueHolderRef.current.addProject({ title: 'Pub', status: 'published' })
    })
    act(() => {
      valueHolderRef.current.saveDraft(project.id)
    })
    expect(valueHolderRef.current.projects[0].status).toBe('draft')
  })

  it('throws when useProjects is used outside provider', () => {
    const ErrorComponent = () => {
      useProjects()
      return null
    }
    expect(() => render(<ErrorComponent />)).toThrow(
      'useProjects must be used within a ProjectsProvider'
    )
  })
})
