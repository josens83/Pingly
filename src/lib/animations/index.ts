/**
 * Animation Utilities
 * Chapter 16: Micro Interactions and Animations
 *
 * Export all animation utilities for easy import
 */

// Framer Motion variants
export {
  // Easings and durations
  easings,
  durations,
  baseTransition,

  // Fade variants
  fadeVariants,
  fadeUpVariants,
  fadeDownVariants,

  // Scale variants
  scaleVariants,

  // Slide variants
  slideVariants,

  // Stagger animations
  staggerContainerVariants,
  staggerItemVariants,

  // Modal/Dialog
  modalVariants,
  overlayVariants,

  // Drawer
  drawerVariants,

  // Toast
  toastVariants,

  // Skeleton
  pulseVariants,

  // Interactions
  hoverScale,
  hoverScaleSmall,
  tapScale,
  buttonVariants,
  cardVariants,

  // Collapse
  collapseVariants,

  // Page transitions
  pageVariants,

  // List animations
  listVariants,
  listItemVariants,
} from './variants'

// Animation hooks
export {
  usePrefersReducedMotion,
  useReducedMotionVariants,
  useAnimateOnScroll,
  useDelayedAnimation,
  useCountAnimation,
  useTypewriter,
} from './hooks'

// CSS class utilities for Tailwind transitions
export const transitionClasses = {
  // Base transitions
  base: 'transition-all duration-200 ease-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-300 ease-out',

  // Specific property transitions
  opacity: 'transition-opacity duration-200 ease-out',
  transform: 'transition-transform duration-200 ease-out',
  colors: 'transition-colors duration-200 ease-out',
  shadow: 'transition-shadow duration-200 ease-out',

  // Combined common transitions
  button: 'transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]',
  card: 'transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-0.5',
  link: 'transition-colors duration-150 ease-out',
  input: 'transition-all duration-200 ease-out focus:ring-2 focus:ring-primary/20',

  // Reduced motion safe
  safeOpacity: 'motion-safe:transition-opacity motion-safe:duration-200',
  safeTransform: 'motion-safe:transition-transform motion-safe:duration-200',
  safeAll: 'motion-safe:transition-all motion-safe:duration-200',
} as const

// Animation keyframes for Tailwind config
export const keyframes = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeOut: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  slideUp: {
    '0%': { transform: 'translateY(10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideDown: {
    '0%': { transform: 'translateY(-10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  scaleIn: {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
} as const

// Tailwind animation utilities
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  shimmer: 'animate-shimmer',
} as const
