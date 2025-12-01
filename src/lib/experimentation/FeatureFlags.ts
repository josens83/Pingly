/**
 * Feature Flags System (Netflix/Spotify Style)
 *
 * Enterprise-grade feature flag management with:
 * - User segmentation
 * - Percentage rollouts
 * - A/B testing integration
 * - Real-time updates
 * - Audit logging
 */

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetingRules: TargetingRule[];
  variants: Variant[];
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  tags: string[];
}

export interface TargetingRule {
  id: string;
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'regex';
  value: string | number | boolean | string[];
  enabled: boolean;
}

export interface Variant {
  id: string;
  name: string;
  weight: number;
  payload?: Record<string, unknown>;
}

export interface UserContext {
  userId: string;
  email?: string;
  country?: string;
  language?: string;
  platform?: 'web' | 'ios' | 'android';
  appVersion?: string;
  userAgent?: string;
  customAttributes?: Record<string, unknown>;
  groups?: string[];
  createdAt?: Date;
  subscriptionTier?: 'free' | 'basic' | 'premium' | 'enterprise';
}

export interface EvaluationResult {
  flagId: string;
  enabled: boolean;
  variant?: Variant;
  reason: EvaluationReason;
  timestamp: Date;
}

export type EvaluationReason =
  | 'FLAG_DISABLED'
  | 'USER_TARGETED'
  | 'PERCENTAGE_ROLLOUT'
  | 'RULE_MATCH'
  | 'DEFAULT_VARIANT'
  | 'OVERRIDE';

type FlagListener = (flag: FeatureFlag, result: EvaluationResult) => void;

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, Map<string, boolean>> = new Map();
  private cache: Map<string, EvaluationResult> = new Map();
  private listeners: Set<FlagListener> = new Set();
  private userContext: UserContext | null = null;

  /**
   * Initialize with flags from server
   */
  async initialize(flags: FeatureFlag[]): Promise<void> {
    flags.forEach(flag => this.flags.set(flag.id, flag));

    // Load local overrides from storage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('feature_flag_overrides');
        if (stored) {
          const overrides = JSON.parse(stored);
          Object.entries(overrides).forEach(([flagId, userOverrides]) => {
            this.overrides.set(flagId, new Map(Object.entries(userOverrides as Record<string, boolean>)));
          });
        }
      } catch (e) {
        console.warn('Failed to load feature flag overrides:', e);
      }
    }
  }

  /**
   * Set user context for targeting
   */
  setUserContext(context: UserContext): void {
    this.userContext = context;
    this.cache.clear(); // Clear cache when context changes
  }

  /**
   * Evaluate a feature flag for the current user
   */
  isEnabled(flagId: string, defaultValue = false): boolean {
    const result = this.evaluate(flagId);
    return result?.enabled ?? defaultValue;
  }

  /**
   * Get variant for a feature flag
   */
  getVariant(flagId: string): Variant | undefined {
    const result = this.evaluate(flagId);
    return result?.variant;
  }

  /**
   * Full evaluation with reason
   */
  evaluate(flagId: string): EvaluationResult | null {
    const cacheKey = this.getCacheKey(flagId);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const flag = this.flags.get(flagId);
    if (!flag) {
      return null;
    }

    const result = this.evaluateFlag(flag);
    this.cache.set(cacheKey, result);

    // Notify listeners
    this.listeners.forEach(listener => listener(flag, result));

    return result;
  }

  private evaluateFlag(flag: FeatureFlag): EvaluationResult {
    const timestamp = new Date();
    const userId = this.userContext?.userId || 'anonymous';

    // Check for user-specific override
    const flagOverrides = this.overrides.get(flag.id);
    if (flagOverrides?.has(userId)) {
      return {
        flagId: flag.id,
        enabled: flagOverrides.get(userId)!,
        reason: 'OVERRIDE',
        timestamp
      };
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return {
        flagId: flag.id,
        enabled: false,
        reason: 'FLAG_DISABLED',
        timestamp
      };
    }

    // Check targeting rules
    if (this.userContext && flag.targetingRules.length > 0) {
      const ruleMatch = this.evaluateRules(flag.targetingRules);
      if (ruleMatch !== null) {
        return {
          flagId: flag.id,
          enabled: ruleMatch,
          variant: this.selectVariant(flag, userId),
          reason: 'RULE_MATCH',
          timestamp
        };
      }
    }

    // Check percentage rollout
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashUserId(userId, flag.id);
      const bucket = hash % 100;

      if (bucket >= flag.rolloutPercentage) {
        return {
          flagId: flag.id,
          enabled: false,
          reason: 'PERCENTAGE_ROLLOUT',
          timestamp
        };
      }
    }

    // Flag is enabled, select variant
    return {
      flagId: flag.id,
      enabled: true,
      variant: this.selectVariant(flag, userId),
      reason: 'DEFAULT_VARIANT',
      timestamp
    };
  }

  private evaluateRules(rules: TargetingRule[]): boolean | null {
    if (!this.userContext) return null;

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const attributeValue = this.getAttributeValue(rule.attribute);
      if (attributeValue === undefined) continue;

      if (this.evaluateRule(rule, attributeValue)) {
        return true;
      }
    }

    return null;
  }

  private getAttributeValue(attribute: string): unknown {
    if (!this.userContext) return undefined;

    const parts = attribute.split('.');
    let value: unknown = this.userContext;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private evaluateRule(rule: TargetingRule, attributeValue: unknown): boolean {
    const { operator, value } = rule;

    switch (operator) {
      case 'equals':
        return attributeValue === value;
      case 'not_equals':
        return attributeValue !== value;
      case 'contains':
        return String(attributeValue).includes(String(value));
      case 'not_contains':
        return !String(attributeValue).includes(String(value));
      case 'in':
        return Array.isArray(value) && value.includes(attributeValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(attributeValue);
      case 'greater_than':
        return Number(attributeValue) > Number(value);
      case 'less_than':
        return Number(attributeValue) < Number(value);
      case 'regex':
        try {
          return new RegExp(String(value)).test(String(attributeValue));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  private selectVariant(flag: FeatureFlag, userId: string): Variant | undefined {
    if (flag.variants.length === 0) return undefined;
    if (flag.variants.length === 1) return flag.variants[0];

    // Weighted random selection based on user hash
    const hash = this.hashUserId(userId, `${flag.id}_variant`);
    const totalWeight = flag.variants.reduce((sum, v) => sum + v.weight, 0);
    const bucket = hash % totalWeight;

    let cumulative = 0;
    for (const variant of flag.variants) {
      cumulative += variant.weight;
      if (bucket < cumulative) {
        return variant;
      }
    }

    return flag.variants[flag.variants.length - 1];
  }

  /**
   * Deterministic hash for consistent bucket assignment
   */
  private hashUserId(userId: string, salt: string): number {
    const str = `${userId}:${salt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private getCacheKey(flagId: string): string {
    const userId = this.userContext?.userId || 'anonymous';
    return `${flagId}:${userId}`;
  }

  /**
   * Set override for a specific user
   */
  setOverride(flagId: string, userId: string, enabled: boolean): void {
    if (!this.overrides.has(flagId)) {
      this.overrides.set(flagId, new Map());
    }
    this.overrides.get(flagId)!.set(userId, enabled);
    this.cache.clear();
    this.persistOverrides();
  }

  /**
   * Clear override for a specific user
   */
  clearOverride(flagId: string, userId: string): void {
    this.overrides.get(flagId)?.delete(userId);
    this.cache.clear();
    this.persistOverrides();
  }

  private persistOverrides(): void {
    if (typeof window === 'undefined') return;

    const obj: Record<string, Record<string, boolean>> = {};
    this.overrides.forEach((userMap, flagId) => {
      obj[flagId] = Object.fromEntries(userMap);
    });

    try {
      localStorage.setItem('feature_flag_overrides', JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to persist feature flag overrides:', e);
    }
  }

  /**
   * Subscribe to flag evaluations
   */
  subscribe(listener: FlagListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update a flag (from server push)
   */
  updateFlag(flag: FeatureFlag): void {
    this.flags.set(flag.id, flag);
    // Clear cache for this flag
    const prefix = `${flag.id}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get all flags for admin UI
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagService();

// React hook
export function useFeatureFlag(flagId: string, defaultValue = false): boolean {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  // In a real implementation, this would use React state
  return featureFlags.isEnabled(flagId, defaultValue);
}

export function useFeatureVariant(flagId: string): Variant | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return featureFlags.getVariant(flagId);
}

// Utility to create feature flags
export function createFlag(config: Partial<FeatureFlag> & { id: string; name: string }): FeatureFlag {
  return {
    description: '',
    enabled: true,
    rolloutPercentage: 100,
    targetingRules: [],
    variants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: '',
    tags: [],
    ...config
  };
}
