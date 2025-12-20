/**
 * Framer Motion Animation Variants
 * Chapter 16: Micro Interactions and Animations
 *
 * Pre-defined animation variants for consistent UI animations
 * All animations respect prefers-reduced-motion
 */

import { Variants, Transition } from 'framer-motion'

// Standard timing functions
export const easings = {
  easeOut: [0.22, 1, 0.36, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
} as const

// Standard durations (in seconds)
export const durations = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
} as const

// Base transition
export const baseTransition: Transition = {
  duration: durations.normal,
  ease: easings.easeOut,
}

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Fade with slight upward movement
 */
export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

/**
 * Fade with slight downward movement
 */
export const fadeDownVariants: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

/**
 * Scale animations (for buttons, cards)
 */
export const scaleVariants: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
}

/**
 * Slide animations
 */
export const slideVariants = {
  left: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  } as Variants,
  right: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  } as Variants,
  up: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  } as Variants,
  down: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  } as Variants,
}

/**
 * Stagger container for children animations
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

/**
 * Stagger item for use with stagger container
 */
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

/**
 * Modal/Dialog animations
 */
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
}

/**
 * Overlay/Backdrop animations
 */
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Drawer/Sidebar animations
 */
export const drawerVariants = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  } as Variants,
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  } as Variants,
}

/**
 * Toast/Notification animations
 */
export const toastVariants: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
}

/**
 * Skeleton loading pulse
 */
export const pulseVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1,
    },
  },
}

/**
 * Hover interactions
 */
export const hoverScale = {
  scale: 1.02,
  transition: { duration: durations.fast },
}

export const hoverScaleSmall = {
  scale: 1.01,
  transition: { duration: durations.fast },
}

/**
 * Tap/Press interactions
 */
export const tapScale = {
  scale: 0.98,
  transition: { duration: durations.fast },
}

/**
 * Button interaction states
 */
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

/**
 * Card interaction states
 */
export const cardVariants: Variants = {
  initial: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: {
    scale: 1.01,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: { duration: durations.normal },
  },
}

/**
 * Accordion/Collapse animations
 */
export const collapseVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: durations.slow },
      opacity: { duration: durations.normal, delay: 0.1 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: durations.slow },
      opacity: { duration: durations.fast },
    },
  },
}

/**
 * Page transitions
 */
export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * List item animations with stagger
 */
export const listVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
}
