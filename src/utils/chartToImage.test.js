import { describe, it, expect, vi, beforeEach } from 'vitest'
import { captureChartAsImage, captureChartAsBlob, captureMultipleCharts } from './chartToImage'

vi.mock('html2canvas', () => ({
  default: vi.fn(),
}))

import html2canvas from 'html2canvas'

describe('chartToImage', () => {
  let mockElement
  let mockCanvas

  beforeEach(() => {
    vi.clearAllMocks()
    mockElement = document.createElement('div')
    mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mockImageData'),
      toBlob: vi.fn((callback) => callback(new Blob(['mock'], { type: 'image/png' }))),
    }
    html2canvas.mockResolvedValue(mockCanvas)
  })

  describe('captureChartAsImage', () => {
    it('should capture an element as a data URL', async () => {
      const result = await captureChartAsImage(mockElement)

      expect(html2canvas).toHaveBeenCalledWith(mockElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      })
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png')
      expect(result).toBe('data:image/png;base64,mockImageData')
    })

    it('should merge custom options', async () => {
      await captureChartAsImage(mockElement, { scale: 3, backgroundColor: '#000000' })

      expect(html2canvas).toHaveBeenCalledWith(mockElement, {
        scale: 3,
        backgroundColor: '#000000',
        logging: false,
        useCORS: true,
      })
    })

    it('should throw when element is null', async () => {
      await expect(captureChartAsImage(null)).rejects.toThrow('Element is required')
    })
  })

  describe('captureChartAsBlob', () => {
    it('should capture an element as a blob', async () => {
      const result = await captureChartAsBlob(mockElement)

      expect(result).toBeInstanceOf(Blob)
    })

    it('should throw when element is null', async () => {
      await expect(captureChartAsBlob(null)).rejects.toThrow('Element is required')
    })

    it('should reject when blob creation fails', async () => {
      mockCanvas.toBlob = vi.fn((callback) => callback(null))
      html2canvas.mockResolvedValue(mockCanvas)

      await expect(captureChartAsBlob(mockElement)).rejects.toThrow('Failed to create blob')
    })
  })

  describe('captureMultipleCharts', () => {
    it('should capture multiple elements', async () => {
      const elements = [document.createElement('div'), document.createElement('div')]
      const results = await captureMultipleCharts(elements)

      expect(results).toHaveLength(2)
      expect(html2canvas).toHaveBeenCalledTimes(2)
    })

    it('should throw for empty array', async () => {
      await expect(captureMultipleCharts([])).rejects.toThrow('must not be empty')
    })

    it('should throw for non-array input', async () => {
      await expect(captureMultipleCharts(null)).rejects.toThrow('must not be empty')
    })
  })
})
