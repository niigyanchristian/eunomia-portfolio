import html2canvas from 'html2canvas'

const DEFAULT_OPTIONS = {
  scale: 2,
  backgroundColor: '#ffffff',
  logging: false,
  useCORS: true,
}

export async function captureChartAsImage(element, options = {}) {
  if (!element) {
    throw new Error('Element is required for chart capture')
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  const canvas = await html2canvas(element, mergedOptions)
  return canvas.toDataURL('image/png')
}

export async function captureChartAsBlob(element, options = {}) {
  if (!element) {
    throw new Error('Element is required for chart capture')
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  const canvas = await html2canvas(element, mergedOptions)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create blob from canvas'))
      }
    }, 'image/png')
  })
}

export async function captureMultipleCharts(elements, options = {}) {
  if (!Array.isArray(elements) || elements.length === 0) {
    throw new Error('Elements array is required and must not be empty')
  }

  const results = []
  for (const element of elements) {
    const dataUrl = await captureChartAsImage(element, options)
    results.push(dataUrl)
  }
  return results
}
