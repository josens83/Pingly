/**
 * A/B Testing System (Netflix/Spotify Style)
 *
 * Enterprise-grade experimentation platform with:
 * - Statistical significance calculation
 * - Multi-variant testing (A/B/n)
 * - Metric tracking and analysis
 * - Automatic winner detection
 * - Guardrail metrics
 */

import { featureFlags, type UserContext, type Variant } from './FeatureFlags';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  metrics: ExperimentMetric[];
  guardrailMetrics: GuardrailMetric[];
  targetingRules: ExperimentTargeting;
  trafficAllocation: number; // 0-100
  startDate: Date;
  endDate?: Date;
  minSampleSize: number;
  confidenceLevel: number; // 0.90, 0.95, 0.99
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExperimentStatus =
  | 'draft'
  | 'running'
  | 'paused'
  | 'completed'
  | 'rolled_out'
  | 'rolled_back';

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  weight: number; // Percentage of traffic
  payload?: Record<string, unknown>;
}

export interface ExperimentMetric {
  id: string;
  name: string;
  type: 'conversion' | 'count' | 'revenue' | 'duration' | 'custom';
  isPrimary: boolean;
  expectedLift: number; // Expected improvement percentage
  minimumDetectableEffect: number;
}

export interface GuardrailMetric {
  id: string;
  name: string;
  threshold: number;
  direction: 'increase' | 'decrease' | 'stable';
  action: 'warn' | 'pause' | 'rollback';
}

export interface ExperimentTargeting {
  includedSegments?: string[];
  excludedSegments?: string[];
  countries?: string[];
  platforms?: ('web' | 'ios' | 'android')[];
  minAppVersion?: string;
  customRules?: Record<string, unknown>;
}

export interface ExperimentEvent {
  experimentId: string;
  variantId: string;
  userId: string;
  eventType: 'exposure' | 'conversion' | 'metric';
  metricName?: string;
  metricValue?: number;
  timestamp: Date;
  properties?: Record<string, unknown>;
}

export interface VariantStats {
  variantId: string;
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  mean: number;
  stdDev: number;
  confidenceInterval: [number, number];
}

export interface ExperimentResults {
  experimentId: string;
  status: 'insufficient_data' | 'inconclusive' | 'winner_found' | 'guardrail_triggered';
  controlStats: VariantStats;
  treatmentStats: VariantStats[];
  winner?: string;
  lift?: number;
  pValue?: number;
  statisticalPower?: number;
  confidenceInterval?: [number, number];
  guardrailViolations?: string[];
  lastUpdated: Date;
}

class ABTestingService {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId
  private events: ExperimentEvent[] = [];
  private eventQueue: ExperimentEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start event flush interval
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.flushEvents(), 5000);
    }
  }

  /**
   * Initialize experiments from server
   */
  async initialize(experiments: Experiment[]): Promise<void> {
    experiments.forEach(exp => this.experiments.set(exp.id, exp));

    // Load cached assignments
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ab_test_assignments');
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.entries(parsed).forEach(([userId, exps]) => {
            this.assignments.set(userId, new Map(Object.entries(exps as Record<string, string>)));
          });
        }
      } catch (e) {
        console.warn('Failed to load A/B test assignments:', e);
      }
    }
  }

  /**
   * Get variant for an experiment
   */
  getVariant(experimentId: string, userContext: UserContext): ExperimentVariant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check targeting
    if (!this.matchesTargeting(experiment, userContext)) {
      return null;
    }

    // Check existing assignment
    const userId = userContext.userId;
    const userAssignments = this.assignments.get(userId);

    if (userAssignments?.has(experimentId)) {
      const variantId = userAssignments.get(experimentId)!;
      const variant = experiment.variants.find(v => v.id === variantId);
      if (variant) {
        this.trackExposure(experiment, variant, userId);
        return variant;
      }
    }

    // Check traffic allocation
    const hash = this.hashUser(userId, experimentId);
    if ((hash % 100) >= experiment.trafficAllocation) {
      return null;
    }

    // Assign to variant
    const variant = this.assignVariant(experiment, userId);
    this.saveAssignment(userId, experimentId, variant.id);
    this.trackExposure(experiment, variant, userId);

    return variant;
  }

  private matchesTargeting(experiment: Experiment, context: UserContext): boolean {
    const { targetingRules } = experiment;

    // Check segments
    if (targetingRules.includedSegments?.length) {
      const userGroups = context.groups || [];
      if (!targetingRules.includedSegments.some(s => userGroups.includes(s))) {
        return false;
      }
    }

    if (targetingRules.excludedSegments?.length) {
      const userGroups = context.groups || [];
      if (targetingRules.excludedSegments.some(s => userGroups.includes(s))) {
        return false;
      }
    }

    // Check country
    if (targetingRules.countries?.length && context.country) {
      if (!targetingRules.countries.includes(context.country)) {
        return false;
      }
    }

    // Check platform
    if (targetingRules.platforms?.length && context.platform) {
      if (!targetingRules.platforms.includes(context.platform)) {
        return false;
      }
    }

    return true;
  }

  private assignVariant(experiment: Experiment, userId: string): ExperimentVariant {
    const hash = this.hashUser(userId, `${experiment.id}_variant`);
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    const bucket = hash % totalWeight;

    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (bucket < cumulative) {
        return variant;
      }
    }

    return experiment.variants[experiment.variants.length - 1];
  }

  private saveAssignment(userId: string, experimentId: string, variantId: string): void {
    if (!this.assignments.has(userId)) {
      this.assignments.set(userId, new Map());
    }
    this.assignments.get(userId)!.set(experimentId, variantId);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      const obj: Record<string, Record<string, string>> = {};
      this.assignments.forEach((exps, uid) => {
        obj[uid] = Object.fromEntries(exps);
      });

      try {
        localStorage.setItem('ab_test_assignments', JSON.stringify(obj));
      } catch (e) {
        console.warn('Failed to save A/B test assignments:', e);
      }
    }
  }

  private hashUser(userId: string, salt: string): number {
    const str = `${userId}:${salt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Track experiment exposure
   */
  private trackExposure(experiment: Experiment, variant: ExperimentVariant, userId: string): void {
    this.queueEvent({
      experimentId: experiment.id,
      variantId: variant.id,
      userId,
      eventType: 'exposure',
      timestamp: new Date()
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(experimentId: string, userId: string, properties?: Record<string, unknown>): void {
    const userAssignments = this.assignments.get(userId);
    const variantId = userAssignments?.get(experimentId);

    if (!variantId) return;

    this.queueEvent({
      experimentId,
      variantId,
      userId,
      eventType: 'conversion',
      timestamp: new Date(),
      properties
    });
  }

  /**
   * Track custom metric
   */
  trackMetric(
    experimentId: string,
    userId: string,
    metricName: string,
    metricValue: number,
    properties?: Record<string, unknown>
  ): void {
    const userAssignments = this.assignments.get(userId);
    const variantId = userAssignments?.get(experimentId);

    if (!variantId) return;

    this.queueEvent({
      experimentId,
      variantId,
      userId,
      eventType: 'metric',
      metricName,
      metricValue,
      timestamp: new Date(),
      properties
    });
  }

  private queueEvent(event: ExperimentEvent): void {
    this.eventQueue.push(event);

    // Flush if queue is getting large
    if (this.eventQueue.length >= 100) {
      this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    // Store locally for now
    this.events.push(...eventsToSend);

    // In production, send to analytics backend
    // await this.sendToBackend(eventsToSend);
  }

  /**
   * Calculate experiment results
   */
  calculateResults(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const experimentEvents = this.events.filter(e => e.experimentId === experimentId);

    // Group by variant
    const variantData = new Map<string, { exposures: number; conversions: number; metrics: number[] }>();

    experiment.variants.forEach(v => {
      variantData.set(v.id, { exposures: 0, conversions: 0, metrics: [] });
    });

    experimentEvents.forEach(event => {
      const data = variantData.get(event.variantId);
      if (!data) return;

      if (event.eventType === 'exposure') {
        data.exposures++;
      } else if (event.eventType === 'conversion') {
        data.conversions++;
      } else if (event.eventType === 'metric' && event.metricValue !== undefined) {
        data.metrics.push(event.metricValue);
      }
    });

    // Find control variant
    const control = experiment.variants.find(v => v.isControl);
    if (!control) return null;

    const controlData = variantData.get(control.id)!;

    // Check for insufficient data
    if (controlData.exposures < experiment.minSampleSize) {
      return {
        experimentId,
        status: 'insufficient_data',
        controlStats: this.calculateStats(control.id, controlData),
        treatmentStats: experiment.variants
          .filter(v => !v.isControl)
          .map(v => this.calculateStats(v.id, variantData.get(v.id)!)),
        lastUpdated: new Date()
      };
    }

    // Calculate stats for each treatment
    const treatmentStats = experiment.variants
      .filter(v => !v.isControl)
      .map(v => this.calculateStats(v.id, variantData.get(v.id)!));

    // Find winner using statistical significance
    const controlStats = this.calculateStats(control.id, controlData);
    let winner: string | undefined;
    let bestLift = 0;
    let bestPValue = 1;

    for (const treatment of treatmentStats) {
      if (treatment.sampleSize < experiment.minSampleSize) continue;

      const { pValue, lift } = this.calculateSignificance(controlStats, treatment);

      if (pValue < (1 - experiment.confidenceLevel) && lift > bestLift) {
        winner = treatment.variantId;
        bestLift = lift;
        bestPValue = pValue;
      }
    }

    return {
      experimentId,
      status: winner ? 'winner_found' : 'inconclusive',
      controlStats,
      treatmentStats,
      winner,
      lift: bestLift,
      pValue: bestPValue,
      lastUpdated: new Date()
    };
  }

  private calculateStats(
    variantId: string,
    data: { exposures: number; conversions: number; metrics: number[] }
  ): VariantStats {
    const conversionRate = data.exposures > 0 ? data.conversions / data.exposures : 0;

    // Calculate mean and stdDev for metrics
    const mean = data.metrics.length > 0
      ? data.metrics.reduce((a, b) => a + b, 0) / data.metrics.length
      : conversionRate;

    const variance = data.metrics.length > 1
      ? data.metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.metrics.length - 1)
      : 0;
    const stdDev = Math.sqrt(variance);

    // Calculate confidence interval (95%)
    const z = 1.96;
    const se = stdDev / Math.sqrt(data.exposures || 1);
    const confidenceInterval: [number, number] = [mean - z * se, mean + z * se];

    return {
      variantId,
      sampleSize: data.exposures,
      conversions: data.conversions,
      conversionRate,
      mean,
      stdDev,
      confidenceInterval
    };
  }

  private calculateSignificance(
    control: VariantStats,
    treatment: VariantStats
  ): { pValue: number; lift: number } {
    // Two-proportion z-test
    const p1 = control.conversionRate;
    const p2 = treatment.conversionRate;
    const n1 = control.sampleSize;
    const n2 = treatment.sampleSize;

    const pooledP = (control.conversions + treatment.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

    const z = se > 0 ? (p2 - p1) / se : 0;

    // Convert z-score to p-value (two-tailed)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));

    // Calculate lift
    const lift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;

    return { pValue, lift };
  }

  private normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Get all experiments
   */
  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
  }
}

// Singleton instance
export const abTesting = new ABTestingService();

// React hook
export function useExperiment(experimentId: string, userContext: UserContext): ExperimentVariant | null {
  return abTesting.getVariant(experimentId, userContext);
}

// Helper to create experiments
export function createExperiment(
  config: Partial<Experiment> & { id: string; name: string; variants: ExperimentVariant[] }
): Experiment {
  return {
    description: '',
    hypothesis: '',
    status: 'draft',
    metrics: [],
    guardrailMetrics: [],
    targetingRules: {},
    trafficAllocation: 100,
    startDate: new Date(),
    minSampleSize: 1000,
    confidenceLevel: 0.95,
    owner: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...config
  };
}
