import '@testing-library/jest-dom'
import { beforeEach, afterEach, vi } from 'vitest'

let localStorageMock

beforeEach(() => {
  localStorageMock = {
    getItem: vi.fn(() => 'light'),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  global.localStorage = localStorageMock
  document.documentElement.className = ''
})

afterEach(() => {
  vi.clearAllMocks()
  document.documentElement.className = ''
})
