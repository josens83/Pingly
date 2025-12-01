/**
 * Image Optimization Utilities
 * Production-grade image handling
 */

export interface ImageOptimizationOptions {
  /** Image width */
  width?: number
  /** Image height */
  height?: number
  /** Image quality (1-100) */
  quality?: number
  /** Image format */
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  /** Fit mode */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  /** Blur placeholder */
  blur?: number
}

/**
 * Generate optimized image URL with query parameters
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover',
  } = options

  // If it's an external URL, return as-is (Next.js Image will handle it)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // Build query string for internal images
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  params.set('format', format)
  params.set('fit', fit)

  return `${src}?${params.toString()}`
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, { ...options, width })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints: { maxWidth?: number; size: string }[]
): string {
  return breakpoints
    .map(({ maxWidth, size }) =>
      maxWidth ? `(max-width: ${maxWidth}px) ${size}` : size
    )
    .join(', ')
}

/**
 * Generate blur placeholder data URL
 */
export async function generateBlurPlaceholder(
  src: string,
  size = 10
): Promise<string> {
  if (typeof window === 'undefined') return ''

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = Math.round(size * (img.height / img.width))

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.1))
      } else {
        resolve('')
      }
    }
    img.onerror = () => resolve('')
    img.src = src
  })
}

/**
 * Check if browser supports WebP
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.width > 0 && img.height > 0)
    img.onerror = () => resolve(false)
    img.src =
      'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
  })
}

/**
 * Check if browser supports AVIF
 */
export async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.width > 0 && img.height > 0)
    img.onerror = () => resolve(false)
    img.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAQ0AIyDQAAAA'
  })
}

/**
 * Get best supported image format
 */
export async function getBestImageFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  if (await supportsAVIF()) return 'avif'
  if (await supportsWebP()) return 'webp'
  return 'jpeg'
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, options: ImageOptimizationOptions = {}): void {
  if (typeof window === 'undefined') return

  const url = getOptimizedImageUrl(src, options)
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = url
  if (options.format) {
    link.type = `image/${options.format}`
  }
  document.head.appendChild(link)
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height
}

/**
 * Get image dimensions from URL
 */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}
