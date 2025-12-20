/**
 * Animation Hooks
 * Chapter 16 & 17: Animations with Accessibility Support
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to detect user's motion preference
 * Returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is available (SSR safe)
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook that returns animation variants based on user's motion preference
 * If user prefers reduced motion, returns instant transitions
 */
export function useReducedMotionVariants<T extends object>(
  variants: T,
  reducedVariants?: Partial<T>
): T {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    // Return instant transitions (no animation)
    return {
      ...variants,
      ...reducedVariants,
      // Override common animation properties
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    } as T
  }

  return variants
}

/**
 * Hook for intersection observer based animations
 * Triggers animation when element enters viewport
 */
export function useAnimateOnScroll(
  threshold: number = 0.1,
  triggerOnce: boolean = true
): {
  ref: (node: HTMLElement | null) => void
  isInView: boolean
} {
  const [isInView, setIsInView] = useState(false)
  const [element, setElement] = useState<HTMLElement | null>(null)

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node)
  }, [])

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [element, threshold, triggerOnce])

  return { ref, isInView }
}

/**
 * Hook for delayed animation (useful for staggered effects)
 */
export function useDelayedAnimation(
  delay: number,
  condition: boolean = true
): boolean {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (!condition) {
      setShouldAnimate(false)
      return
    }

    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [delay, condition])

  return shouldAnimate
}

/**
 * Hook for number counting animation
 */
export function useCountAnimation(
  target: number,
  duration: number = 1000,
  startOnMount: boolean = true
): number {
  const [count, setCount] = useState(startOnMount ? 0 : target)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(target)
      return
    }

    if (!startOnMount) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [target, duration, startOnMount, prefersReducedMotion])

  return count
}

/**
 * Hook for typewriter effect
 */
export function useTypewriter(
  text: string,
  speed: number = 50,
  startOnMount: boolean = true
): { displayText: string; isComplete: boolean } {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || !startOnMount) {
      setDisplayText(text)
      setIsComplete(true)
      return
    }

    setDisplayText('')
    setIsComplete(false)

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => {
      clearInterval(interval)
    }
  }, [text, speed, startOnMount, prefersReducedMotion])

  return { displayText, isComplete }
}
