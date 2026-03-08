import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ProfilePhoto } from './ProfilePhoto'
import { ProfileContext } from '../../context/ProfileContext'

function renderWithContext(profileValue) {
  return render(
    <ProfileContext.Provider value={profileValue}>
      <ProfilePhoto />
    </ProfileContext.Provider>
  )
}

describe('ProfilePhoto', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders placeholder SVG when no photoUrl is set', () => {
    renderWithContext({ profile: { photoUrl: '' }, saveProfile: vi.fn() })
    expect(screen.getByRole('img', { name: /default avatar/i })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /profile photo/i })).not.toBeInTheDocument()
  })

  it('renders profile photo when photoUrl is set', () => {
    renderWithContext({
      profile: { photoUrl: 'data:image/jpeg;base64,abc123' },
      saveProfile: vi.fn(),
    })
    expect(screen.getByRole('img', { name: /profile photo/i })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /default avatar/i })).not.toBeInTheDocument()
  })

  it('clicking upload button triggers file input click', () => {
    renderWithContext({ profile: { photoUrl: '' }, saveProfile: vi.fn() })

    const fileInput = document.querySelector('input[type="file"]')
    const clickSpy = vi.spyOn(fileInput, 'click')

    const uploadBtn = screen.getByRole('button', { name: /upload photo/i })
    fireEvent.click(uploadBtn)

    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('calls saveProfile with a data URL after file selection', async () => {
    const saveProfile = vi.fn()
    const profile = { photoUrl: '' }
    renderWithContext({ profile, saveProfile })

    const mockDataUrl = 'data:image/jpeg;base64,resizedImage'
    const mockCtx = { drawImage: vi.fn() }

    // Mock canvas
    vi.spyOn(document, 'createElement').mockImplementation(function (tag) {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => mockCtx),
          toDataURL: vi.fn(() => mockDataUrl),
        }
      }
      // Fall through to real implementation
      return HTMLDocument.prototype.createElement.call(document, tag)
    })

    // Capture the FileReader instance that the component creates
    let capturedReader = null
    // eslint-disable-next-line no-unused-vars
    const OriginalFileReader = globalThis.FileReader
    function MockFileReader() {
      capturedReader = this
      this.onload = null
      this.onerror = null
      this.readAsDataURL = vi.fn()
    }
    vi.stubGlobal('FileReader', MockFileReader)

    // Capture the Image instance
    let capturedImage = null
    // eslint-disable-next-line no-unused-vars
    const OriginalImage = globalThis.Image
    function MockImage() {
      capturedImage = this
      this.onload = null
      this.onerror = null
      this.src = ''
    }
    vi.stubGlobal('Image', MockImage)

    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    // Simulate FileReader loading the file
    await act(async () => {
      capturedReader.onload({ target: { result: 'data:image/jpeg;base64,original' } })
    })

    // Simulate Image loading
    await act(async () => {
      Object.defineProperty(capturedImage, 'width', { value: 800, configurable: true })
      Object.defineProperty(capturedImage, 'height', { value: 600, configurable: true })
      capturedImage.onload()
    })

    await waitFor(() => {
      expect(saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({ photoUrl: mockDataUrl })
      )
    })

    vi.unstubAllGlobals()
  })

  it('shows loading indicator while processing image', async () => {
    const saveProfile = vi.fn()
    renderWithContext({ profile: { photoUrl: '' }, saveProfile })

    // Mock FileReader to hang (never resolves the promise)
    function MockFileReader() {
      this.onload = null
      this.onerror = null
      this.readAsDataURL = vi.fn()
    }
    vi.stubGlobal('FileReader', MockFileReader)

    const fileInput = document.querySelector('input[type="file"]')
    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    expect(screen.getByLabelText(/processing image/i)).toBeInTheDocument()

    vi.unstubAllGlobals()
  })
})
