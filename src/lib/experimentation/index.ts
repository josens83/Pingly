/**
 * Experimentation Module
 *
 * Enterprise-grade feature flags and A/B testing system
 * inspired by Netflix, Spotify, and other tech giants.
 */

export {
  featureFlags,
  useFeatureFlag,
  useFeatureVariant,
  createFlag,
  type FeatureFlag,
  type TargetingRule,
  type Variant,
  type UserContext,
  type EvaluationResult,
  type EvaluationReason
} from './FeatureFlags';

export {
  abTesting,
  useExperiment,
  createExperiment,
  type Experiment,
  type ExperimentStatus,
  type ExperimentVariant,
  type ExperimentMetric,
  type GuardrailMetric,
  type ExperimentTargeting,
  type ExperimentEvent,
  type VariantStats,
  type ExperimentResults
} from './ABTesting';
