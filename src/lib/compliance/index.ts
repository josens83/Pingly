/**
 * Compliance Module Index
 * Enterprise-level regulatory compliance
 */

// GDPR
export {
  gdprService,
  type ConsentRecord,
  type DataSubjectRequest,
} from './GDPR'

// Accessibility
export {
  trapFocus,
  returnFocus,
  announce,
  getContrastRatio,
  meetsContrastRequirements,
  handleArrowNavigation,
  prefersReducedMotion,
  getSafeAnimationDuration,
  handleSkipLink,
  generateFieldId,
  getErrorId,
  getHelpId,
} from './Accessibility'
