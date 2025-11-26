/**
 * Utils Test Suite
 * Unit tests for utility functions
 */

import { cn } from '@/lib/utils'

describe('cn (className merger)', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('active')
  })

  it('should filter out falsy values', () => {
    const result = cn('base', false, null, undefined, 'valid')
    expect(result).toBe('base valid')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should merge Tailwind classes intelligently', () => {
    // tailwind-merge should handle conflicting classes
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toContain('px-4')
    expect(result).toContain('py-1')
    expect(result).not.toContain('px-2')
  })

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })

  it('should handle object notation', () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    })
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
  })
})
