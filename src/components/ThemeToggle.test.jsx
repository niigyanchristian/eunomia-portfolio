import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  let localStorageMock

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    }
    global.localStorage = localStorageMock

    document.documentElement.className = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()
  })

  it('initializes with light theme by default', () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<ThemeToggle />)

    expect(document.documentElement.className).toBe('light-theme')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('initializes with saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<ThemeToggle />)

    expect(document.documentElement.className).toBe('dark-theme')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('toggles from light to dark theme when clicked', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(document.documentElement.className).toBe('dark-theme')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('toggles from dark to light theme when clicked', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(document.documentElement.className).toBe('light-theme')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('persists theme preference in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('updates aria-label when theme changes', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<ThemeToggle />)

    let button = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    button = screen.getByRole('button', { name: /switch to light mode/i })
    expect(button).toBeInTheDocument()
  })

  it('displays sun icon in light mode', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg.querySelector('path')).toHaveAttribute('d', expect.stringContaining('M10 3V1'))
  })

  it('displays moon icon in dark mode', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg.querySelector('path')).toHaveAttribute('d', expect.stringContaining('M17.293'))
  })

  it('applies theme class to document root element', () => {
    localStorageMock.getItem.mockReturnValue('light')
    render(<ThemeToggle />)

    expect(document.documentElement.className).toBe('light-theme')

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(document.documentElement.className).toBe('dark-theme')
  })
})
