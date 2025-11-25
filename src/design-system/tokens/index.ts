// Pingly Design System - Token Exports
// 모든 디자인 토큰을 한 곳에서 export

export * from './colors'
export * from './typography'
export * from './spacing'
export * from './animations'

// 통합 테마 객체
import { colors, gradients, semanticColors, darkSemanticColors } from './colors'
import { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacings, textStyles } from './typography'
import { spacing, semanticSpacing, containers, breakpoints, zIndices, radii, shadows, blurs } from './spacing'
import { durations, easings, transitions, motionVariants, staggerContainer, keyframes } from './animations'

export const theme = {
  colors,
  gradients,
  semanticColors,
  darkSemanticColors,
  fonts: fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  textStyles,
  spacing,
  semanticSpacing,
  containers,
  breakpoints,
  zIndices,
  radii,
  shadows,
  blurs,
  durations,
  easings,
  transitions,
  motionVariants,
  staggerContainer,
  keyframes,
} as const

export type Theme = typeof theme
